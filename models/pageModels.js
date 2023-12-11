import mongoose from 'mongoose'
const Schema = mongoose.Schema
const pageSchema = new Schema({
  name: {
    type: String
  },
  keys: [{
    type: mongoose.Schema.ObjectId,
    ref: 'keys'
  }],
  status: {
    type: Boolean,
    default: true
  }

},
{ timestamps: true }

)
// pageSchema.index({ name: 1 }, { unique: true })
export const PageModels = mongoose.model('pages', pageSchema)
