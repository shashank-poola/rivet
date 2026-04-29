import type { Request, Response } from "express";
import prisma from "@rivet-n8n/prisma-db";

export const createTrigger = async ( req : Request , res : Response) => {
    try {
        const { name, type , description } = req.body;

        if(!name || !type || !description){
            res.status(403).json({
                success : true,
                message : "Provied proper Inputs"
            })
            return;
        }

        const trigger = await prisma.availableTriggers.create({
            data : {
                name ,
                type,
                description,
            },
            select : {
                id : true,
                name : true,
                type : true,
                description : true
            }
        })

        if(!trigger){
            res.status(403).json({
                success : false,
                message  : "No Trigger Created"
            })
            return;
        }

        res.json({
            success : true,
            message : "Trigger Created Successfully!",
            trigger
        })
    } catch (error : any) {
        console.log("Error while creating triggers" , error.message);
        res.status(500).json({
            success : false,
            message : "Error while creating trigger",
            error
        })
        return;
    }
}

export const getAllTriggers = async ( req : Request , res : Response) => {
    try {

        const triggers  = await prisma.availableTriggers.findMany({
            select : {
                id : true,
                name: true,
                type : true,
                description : true
            }
        });

        if(!triggers){
            res.status(403).json({
                success : false,
                message : "No Triggers Found"
            })
        }

        res.status(200).json({
            success: true,
            message : "All Triggers Fetched!",
            triggers
        })

    }catch(error : any){
        console.log("Error while getting triggers" , error.message);
        res.status(500).json({
            success : false,
            message : "Error while getting all  triggers",
            error
        })
        return;
    }
}