import { ProjectModel } from '../models/projectModels.js'
import logger from '../utilities/logger.js'
import message from '../utilities/messages/message.js'
import { sendBadRequest, sendSuccess } from '../utilities/response/index.js'
import { KeyModel } from '../models/keyModels.js'
import mongoose from 'mongoose'
import { MongoClient } from 'mongodb'

// Connection URI
const uri = 'mongodb://localhost:27017'
const dbName = 'your_database_name'
export const getWebSiteDataByAggregation = async (req, res) => {
  try {
    const projectData = await ProjectModel.findOne({ _id: req.params.projectId }).populate('pages', 'keys')
    if (!projectData) return sendBadRequest(res, message.projectDataNotFound)
    const arrayData = {}
    if (!(projectData.pages.length > 0)) return sendBadRequest(res, message.pageDataNotFound)
    for (const i of projectData.pages) {
      // if (!(i.keys.length > 0)) return sendBadRequest(res, message.keyDataNotFound)
      for (const key of i.keys) {
        const keyData = await KeyModel.find({
          _id: key,
          language: {
            $elemMatch: {
              lg: req.params.languageId
            }
          }
        }).populate('page_id', 'name')
        // if (!(keyData.length > 0)) return sendBadRequest(res, message.keyDataNotFound)
        keyData.forEach((key) => {
          key.language.forEach((languageData) => {
            if (arrayData[key.page_id.name]) {
              arrayData[key.page_id.name][key.key] = languageData.value
            } else {
              arrayData[key.page_id.name] = {
                [key.key]: languageData.value
              }
            }
          })
        })
      }
    }
    return sendSuccess(res, arrayData, message.keyGetSuccessfully)
  } catch (e) {
    logger.error(e)
    logger.error('GET_ALL_PROJECT_DATA')
    return sendBadRequest(res, message.somethingGoneWrong)
  }
}

// export const getWebSiteDataByAggregation = async (req, res) => {
//   try {
//     const webSiteData = await WebsiteModels.findOne({ _id: req.params.websiteId, status: true }).populate({
//       path: 'pages',
//       match: { status: true },
//       select: 'name',
//       populate: {
//         path: 'keys',
//         match: { status: true },
//         select: 'key language.value language.lg',
//         populate: {
//           path: 'language.lg',
//           match: { status: true },
//           select: 'name key'
//         }
//       }
//     })
//     const transformedData = {}

//     webSiteData.pages.forEach((item) => {
//       item.keys.forEach((key) => {
//         key.language.forEach((language) => {
//           const obj = {
//             [item.name]: {
//               [key.key]: language.value
//             }
//           }
//           console.log(transformedData[language.lg.key], 'jujujjjuj')
//           if (!transformedData[language.lg.key]) {
//             transformedData[language.lg.key] = []
//           }

//           const existingItem = transformedData[language.lg.key].find((data) =>
//             Object.keys(data)[0] === item.name
//           )

//           if (existingItem) {
//             // Merge the objects if the key already exists
//             existingItem[item.name] = { ...existingItem[item.name], ...obj[item.name] }
//           } else {
//             transformedData[language.lg.key].push(obj)
//           }
//         })
//       })
//     })

//     return sendSuccess(res, transformedData)
//   } catch (e) {
//     logger.error(e)
//     logger.error('GET_WEBSITE_DATA')
//     return sendBadRequest(res, message.somethingGoneWrong)
//   }
// }

export const getWebSiteDataByAggregations = async (req, res) => {
  try {
    const projectData = await ProjectModel.aggregate([
      {
        $match: { _id: mongoose.Types.ObjectId(req.params.projectId) }
      },
      {
        $lookup: {
          from: 'pages', // The name of the users collection
          localField: 'pages._id', // Field in the current collection to match
          foreignField: '_id', // Field in the users collection to match
          as: 'pageDetails' // The new field where populated data will be stored
        }
      }
    ])
    console.log(projectData)
    if (!projectData) return sendBadRequest(res, message.projectDataNotFound)
  } catch (e) {
    logger.error(e)
    logger.error('GET_ALL_PROJECT_DATA')
    return sendBadRequest(res, message.somethingGoneWrong)
  }
}
// const n = 9
// const array = [1, 5, 6, 3, 8, 9, 7, 6, 0]

// function missingNumber (array, n) {
//   if (array.length > n || array.includes(0)) {
//     console.log('please enter valid number')
//     return 'please enter valid number'
//   }
//   const sortData = array.sort((a, b) => a - b)
//   for (let i = 1; i <= n; i++) {
//     if (i !== sortData[i - 1]) {
//       console.log('nun', i)
//       return i
//     }
//   }
// }

// missingNumber(array, n)

// Create a new MongoClient
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })

// Insert data using async/await
// const insertData = async () => {
//   try {
//     // Connect to the MongoDB server
//     await client.connect()

//     // Select the database
//     const db = client.db(dbName)

//     // Specify the collection
//     const collection = db.collection('user_pay')
//     // Data to be inserted
//     const dataToInsert = {
//       name: 'bhavik',
//       amount: 200000
//       // Add more fields as needed
//     }

//     // Insert the data using insertOne
//     // const result = await collection.insertOne(dataToInsert)

//     const collection2 = db.collection('user_get_details')
//     // Data to be inserted
//     const dataToInsert2 = {
//       paid_amount: 200000
//       // Add more fields as needed
//     }
//     const result = await collection.insertOne(dataToInsert2)

//     console.log('Data inserted successfully:', result.insertedId)
//   } catch (error) {
//     console.error('Error inserting data:', error)
//   } finally {
//     // Close the connection
//     await client.close()
//   }
// }

// // Call the insertData function
// insertData()
