import mongoose, { trusted } from 'mongoose'
import { autoIncrement } from 'mongoose-plugin-autoinc'

const { Schema } = mongoose

const noteSchema = new Schema(
	{
		user: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'User',
		},
		title: {
			type: String,
			required: true,
		},
		text: {
			type: String,
			required: true,
		},

		completed: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	}
)

noteSchema.plugin(autoIncrement, {
	model: 'Note',
	field: 'ticketNum',
	startAt: 500,
	incrementBy: 1,
})

export default mongoose.model('Note', noteSchema)
