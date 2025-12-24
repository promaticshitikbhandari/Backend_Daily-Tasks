import { SubCategory } from '../models/subCategoryModel.js'

const createSubCategory = async (req, res) => {
  try {
    const user = req.user
    const { subname } = req.body
    const {id} = req.params
    if (!subname)
      return res
        .status(400)
        .json({ success: false, message: 'SubCategory is required' })
    
    if(!id) return res
    .status(400)
    .json({ success: false, message: 'Id is required' })

    const createSubCategory = await SubCategory.create({ subname, category_id: id ,admin_id: user._id})
    return res.status(201).json({
      success: true,
      message: 'new SubCategory created',
      data: createSubCategory
    })
  } catch (error) {
    console.log(error)
  }
}

const getSubCategory = async (req, res) => {
  try {
    const user = req.user
    const getSubCategory = await SubCategory.find({ admin_id: user._id })
    return res.status(202).json({
      success: true,
      message: 'SubCategories Fetched',
      data: getSubCategory
    })
  } catch (error) {
    console.log(error)
  }
}

const updateSubCategory = async (req, res) => {
  try {
    const { id } = req.params
    const { subname } = req.body
    const updateSubCategory = await SubCategory.findByIdAndUpdate(
      id,
      { $set: { subname } },
      { new: true }
    )
    return res.status(200).json({
      success: true,
      message: 'SubCategory Updated Successfully',
      data: updateSubCategory
    })
  } catch (error) {
    console.log(error)
  }
}

const deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.params
    const deleteSubCategory = await SubCategory.findByIdAndDelete(id)

    return res.status(200).json({
      success: true,
      message: 'SubCategory Deleted Successfully',
      data: deleteSubCategory
    })
  } catch (error) {
    console.log(error)
  }
}

export {
  createSubCategory,
  getSubCategory,
  updateSubCategory,
  deleteSubCategory
}
