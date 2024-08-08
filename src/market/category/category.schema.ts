import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({
    toJSON: {
        virtuals: true
    }
})
export class Category {
    @Prop({type: String, required: true})
    name: string;

    @Prop({type: [String], required: true})
    images: string[];

    @Prop({type: String, required: true})
    color: string;
}
const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.virtual('id').get(function() {
    return this._id.toHexString();
})

export { CategorySchema }
