import mongoose from 'mongoose'
const Schema = mongoose.Schema

const languageSchema = new Schema({
  name: {
    type: String
  },
  status: {
    type: Boolean,
    default: true
  },
  key: {
    type: String
  },
  code: {
    type: String
  }
},
{ timestamps: true }
)
export const LanguageModels = mongoose.model('languages', languageSchema)
