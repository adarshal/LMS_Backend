import mongoose, { SchemaType, Schema, Model } from "mongoose";


export interface IOrder extends Document{
    courseId:string;
    userId:string;
    payment_info:object;
}
const OrderSchema = new Schema<IOrder>({
    courseId:{
        type:String,
        required:true,
    },
    userId:{
        type:String,
        required:true
    },
    payment_info:{
        type:Object
    }
},{
    timestamps: true // Automatically create created and updatedAt parameters
})


const Order = mongoose.model("Order", OrderSchema);

export default Order;