import mongoose from 'mongoose'
const Schema = mongoose.Schema
const projectSchema = new Schema({
  name: {
    type: 'String'
  },

  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  }],

  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  }],
  languages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'languages'
  }],
  pages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'pages'
  }],
  status: {
    type: Boolean,
    default: true
  }

},
{ timestamps: true }
)

export const ProjectModel = mongoose.model('projects', projectSchema)
