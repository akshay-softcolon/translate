import mongoose from 'mongoose'
const Schema = mongoose.Schema
const userSchema = new Schema({
  username: {
    type: 'String'
  },
  email: {
    type: 'String'
  },
  password: {
    type: 'String'
  },
  access_token_id: {
    type: 'string'
  },
  refresh_token_id: {
    type: 'string'
  }

}
,
{ timestamps: true }
)
export const UserModel = mongoose.model('users', userSchema)
