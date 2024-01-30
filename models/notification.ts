import mongoose, { SchemaType, Schema, Model } from "mongoose";


export interface INotification extends Document{
    title:string;
    message:string;
    status:string;
    user:Object;
}
const NotificationSchema = new Schema<INotification>({
    title:{
        type:String,
        required:true,
    },
    message:{
        type:String,
        required:true
    },
    status:{
        type:String,
        required:true,
        default:"unread",

    },
    user:{
        type:Object
    }
},{
    timestamps: true // Automatically create created and updatedAt parameters
})


const Notification = mongoose.model("Notification", NotificationSchema);

export default Notification;