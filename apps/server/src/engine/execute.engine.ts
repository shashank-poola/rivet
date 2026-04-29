import { Resend } from "resend";
import prisma from "@rivet-n8n/prisma-db";
import TelegramBot from "node-telegram-bot-api";
import axios from "axios";
import { ExecutionStatus } from "@prisma/client";
import { executionEvents } from "../events.js";
import { OpenAI } from "openai";

import bs58 from "bs58"
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction } from "@solana/web3.js";

const getCredentials = async (data : any) => {
    const credentialId = data.config.credential;
    if (!credentialId){
        throw new Error("No credentials added!");
    }
    const credential = await prisma.credential.findUnique({
        where: { id: credentialId  },
        select : {
            data : true
        },
    });

    if(!credential?.data){
        throw new Error("Credential not found");
    }

    return credential.data;
}

const executedIds : string[] = [];

const executeNodes = async (workflowId : string, nodes : any, executionId : string, triggerNodeId? : string ) => {
    const actionNodes = nodes.filter((node : any) => node.type !== 'trigger');

    if (actionNodes.length === 0) {
        return;
    }

    let triggerSuccessEmitted = false;

    for (const node of actionNodes) {
        const { id : nodeId, data } = node;
        const credentialData = await getCredentials(data);

        // Emit start event for node
        executionEvents.emit("update", { executionId, nodeId, status: "RUNNING", ts: Date.now() });

        // Mark trigger as SUCCESS when the first action starts running
        if (!triggerSuccessEmitted && triggerNodeId) {
            executionEvents.emit("update", { executionId, nodeId: triggerNodeId, status: "SUCCESS", ts: Date.now() });
            triggerSuccessEmitted = true;
        }

        switch (data.type) {
            case 'resend': {
                const emailData = await executeResend(data, credentialData, executionId, nodeId);
                if (!emailData.success) {
                    throw new Error(emailData.error || 'Resend execution failed');
                }
                executedIds.push(nodeId);
                break;
            }
            case 'telegram':
                const telegramData = await executeTelegram(data, credentialData, executionId, nodeId);
                if (!telegramData.success) {
                    throw new Error(telegramData.error || 'Telegram execution failed');
                }
                executedIds.push(nodeId);
                break;
            case  'solana' : 
                const solanaTransaction = await sendSolana(data, credentialData, executionId , nodeId);
                if (!solanaTransaction.success) {
                    throw new Error(solanaTransaction.error || 'Solana execution failed');
                }
                break;
            case 'whatsapp':
                await executeWhatsapp(data, credentialData);
                break;
            case 'openai':
                const openaiData = await executeOpenai(data, credentialData,executionId, nodeId);
                if (!openaiData.success) {
                    throw new Error(openaiData.error || 'OpenAI execution failed');
                }
                executedIds.push(nodeId);
                break;
            case 'agent':
                await executeAgent(data);
                break;
            default:
                console.log("No Action executed");
        }

        // Emit success for node
        executionEvents.emit("update", { executionId, nodeId, status: "SUCCESS", ts: Date.now() });
    }
}

const executeResend = async (data : any, credentialData:any, executionId : string, nodeId : string ) => {

    const nodeExecution = await prisma.nodeExecution.create({
        data : {
            execution_id : executionId,
            node_id : nodeId,
            status : ExecutionStatus.RUNNING
        }
    })

    if(!nodeExecution){
        // Emit FAILED if we cannot even create the node execution row
        executionEvents.emit("update", { executionId, nodeId, status: "FAILED", ts: Date.now(), error: "Failed to create node execution" });
        return { error : "Failed to create node execution" , success : false };
    }

    // console.log("Executing resend", data);
    const { to , subject } = data.config;
    let body = data.config.body;
    const { apikey } = credentialData;

    if(!body){
        const nodeId = executedIds[executedIds.length - 1];
        const response = await prisma.nodeExecution.findFirst({
            where : {
                node_id : nodeId
            },
            select : {
                output : true
            }
        })
        console.log("previous node output",response)
        if(!response?.output){
            await prisma.nodeExecution.update({
                where : { id : nodeExecution.id },
                data : {
                    status : ExecutionStatus.FAILED,
                    ended_at : new Date(),
                    error : "Body is required"
                }
            })
            executionEvents.emit("update", { executionId, nodeId, status: "FAILED", ts: Date.now(), error: "Body is required" });
            return { success : false , error : "Body is required" };
        }

        body = response?.output as string;
    }

    const resend = new Resend(apikey);

    const { data : emailData , error } = await resend.emails.send({
        from: "onboarding@resend.dev",
        to: to,
        subject: subject,
        text: body
    });
    
    if(error) {
        await prisma.nodeExecution.update({
            where : { id : nodeExecution.id },
            data : {
                status : ExecutionStatus.FAILED,
                ended_at : new Date(),
                error : error.message
            }
        })
        executionEvents.emit("update", { executionId, nodeId, status: "FAILED", ts: Date.now(), error: error.message });
        return { error : error.message , success : false };
    }

    const updatedNodeExecution = await prisma.nodeExecution.update({
        where : { id : nodeExecution.id },
        data : {
            status : ExecutionStatus.SUCCESS,
            ended_at : new Date(),
            output : emailData as any
        }
    })

    if(!updatedNodeExecution){
        return { error : "Failed to update node execution" , success : false };
    }

    return { data : emailData , success : true };
}

const executeTelegram = async (data : any, credentialData : any, executionId : string, nodeId : string) => {
    // console.log("Executing telegram", data);

    const nodeExecution = await prisma.nodeExecution.create({
        data : {
            execution_id : executionId,
            node_id : nodeId,
            status : ExecutionStatus.RUNNING
        }
    })

    if(!nodeExecution){
        executionEvents.emit("update", { executionId, nodeId, status: "FAILED", ts: Date.now(), error: "Failed to create node execution" });
        return { error : "Failed to create node execution" , success : false };
    }

    const { chatId } = data.config;
    let message = data.config.message;
    const { apikey } = credentialData;

    if(!message){
        const nodeId = executedIds[executedIds.length - 1];
        const response = await prisma.nodeExecution.findFirst({
            where : {
                node_id : nodeId
            },
            select : {
                output : true
            }
        })
        console.log("previous node output",response)
        if(!response?.output){
            await prisma.nodeExecution.update({
                where : { id : nodeExecution.id },
                data : {
                    status : ExecutionStatus.FAILED,
                    ended_at : new Date(),
                    error : "Body is required"
                }
            })
            executionEvents.emit("update", { executionId, nodeId, status: "FAILED", ts: Date.now(), error: "Body is required" });
            return { success : false , error : "Body is required" };
        }
        message = response?.output as string;
    }

    const bot = new TelegramBot(apikey);
    let telegramData : any;
    try {
        telegramData = await bot.sendMessage(chatId, message);
        // console.log(telegramData);
    } catch (error) {
        await prisma.nodeExecution.update({
            where : { id : nodeExecution.id },
            data : {
                status : ExecutionStatus.FAILED,
                ended_at : new Date(),
                error : "Failed to send message"
            }
        })
        executionEvents.emit("update", { executionId, nodeId, status: "FAILED", ts: Date.now(), error: "Failed to send message" });
        return { error : "Failed to send message" , success : false };
    }

    const updatedNodeExecution = await prisma.nodeExecution.update({
        where : { id : nodeExecution.id },
        data : {
            status : ExecutionStatus.SUCCESS,
            ended_at : new Date(),
            output : telegramData as any
        }
    })

    if(!updatedNodeExecution){
        return { error : "Failed to update node execution" , success : false };
    }

    return { data : telegramData , success : true };
}

const executeWhatsapp = async (data : any,  credentialData : any) => {
    console.log("Executing whatsapp", data);

    const { phone, message } = data;
    const { accessToken , businessAccountId } = credentialData.config;

    const url = `https://graph.facebook.com/v20.0/${businessAccountId}/messages`;

    const payload = {
        messaging_product: 'whatsapp',
        to: phone,
        type: 'text',
        text: {
          body: message
        }
    };

    try {
        const response = await axios.post(url, payload, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
    
        if (response.status !== 200 || !response.data.messages) {
          throw new Error(`WhatsApp API error: ${response.data.error?.message || 'Unknown error'}`);
        }
        
        console.log('WhatsApp message sent successfully:', response.data);
    } catch (error : any) {
        console.error('WhatsApp send error:', error.response?.data || error.message);
        throw error; // Propagate to engine for failure status
    }
}

const executeOpenai = async (data : any,credentialData : any ,executionId : string, nodeId : string) => {
    // console.log("Executing openai", data);

    const nodeExecution = await prisma.nodeExecution.create({
        data : {
            execution_id : executionId,
            node_id : nodeId,
            status : ExecutionStatus.RUNNING
        }
    })

    const { prompt } = data.config;
    const { apikey } = credentialData;
    const openai = new OpenAI({ apiKey: apikey });
    try {
    const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "assistant", content: "You are a helpful assistant. use the user's prompt to answer the question. only respond with the answer and no other text." },
                { role: "user", content: prompt }
            ],
        });

        const result = response.choices?.[0]?.message.content;

        const updatedNodeExecution = await prisma.nodeExecution.update({
            where : { id : nodeExecution.id },
            data : {
                status : ExecutionStatus.SUCCESS,
                ended_at : new Date(),
                output : result as any
            }
        })

        if(!updatedNodeExecution){
            return { error : "Failed to update node execution" , success : false };
        }

        // console.log(result);
        return { data: result, success: true };
    } catch (error) {
        console.error('OpenAI send error:', error);
        await prisma.nodeExecution.update({
            where : { id : nodeExecution.id },
            data : {
                status : ExecutionStatus.FAILED,
                ended_at : new Date(),
                error : error as any
            }
        })
        return { error : error as any , success : false , nodeId : nodeExecution.id };
    }
}

const executeAgent = async (data : any) => {
    console.log("Executing agent", data);
}

const sendSolana = async (data : any, credentialData : any ,executionId : string, nodeId : string ) => {
    console.log("Sending solana", data);

    const { privateKey } = credentialData;
    const { address, amount } = data.config;

    const nodeExecution = await prisma.nodeExecution.create({
        data : {
            execution_id : executionId,
            node_id : nodeId,
            status : ExecutionStatus.RUNNING
        }
    })

    if(!nodeExecution){
        executionEvents.emit("update", { executionId, nodeId, status: "FAILED", ts: Date.now(), error: "Failed to create node execution" });
        return { error : "Failed to create node execution" , success : false };
    }

    if(!address || !amount || !privateKey){
        await prisma.nodeExecution.update({
            where : { id : nodeExecution.id },
            data : {
                status : ExecutionStatus.FAILED,
                ended_at : new Date(),
                error : "No data provided for address or amount or privatekey"
            }
        })
        executionEvents.emit("update", { executionId, nodeId, status: "FAILED", ts: Date.now(), error: "Missing address/amount/privateKey" });
        return { error : "No data provided for address or amount or privatekey", success : false };
    }

    const secretKey = bs58.decode(privateKey);

    const payer = Keypair.fromSecretKey(secretKey);

    const connection = new Connection("https://api.devnet.solana.com");

    const tx = new Transaction().add(
        SystemProgram.transfer({
            toPubkey : new PublicKey(address),
            fromPubkey : payer.publicKey,
            lamports : Number(amount) * LAMPORTS_PER_SOL
        })
    )

    tx.feePayer = payer.publicKey;
	tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    let solanaTransaction;
    try {
         solanaTransaction = await sendAndConfirmTransaction(connection, tx, [payer]);
    } catch (error : any) {
        await prisma.nodeExecution.update({
            where : { id : nodeExecution.id },
            data : {
                status : ExecutionStatus.FAILED,
                ended_at : new Date(),
                error : "Failed to send solana"
            }
        })
        executionEvents.emit("update", { executionId, nodeId, status: "FAILED", ts: Date.now(), error: "Failed to send Solana" });
        console.log("Error while transacting :",error.message);
        return { success : false , message: "Transaction Failed" }
    }

    const updatedNodeExecution = await prisma.nodeExecution.update({
        where : { id : nodeExecution.id },
        data : {
            status : ExecutionStatus.SUCCESS,
            ended_at : new Date(),
            output : solanaTransaction as any
        }
    })

    if(!updatedNodeExecution){
        return { error : "Failed to update node execution" , success : false };
    }

    return { data : solanaTransaction , success : true };
}

export default executeNodes;