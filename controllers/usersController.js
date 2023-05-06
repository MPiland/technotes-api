import User from '../models/User.js'
import Note from '../models/Note.js'
import bcrypt from 'bcrypt'

// @desc Get all users
// @route GET /users
// @access Private
export const getAllUsers = async (req, res) => {
  const users = await User.find().select('-password').lean()

  // If no users
  if (!users?.length) {
    return res.status(400).json({ message: 'No users found' })
  }

  res.json(users)
}

// @desc Create new user
// @route POST /users
// @access Private
export const createNewUser = async (req, res) => {
  const { username, password, roles } = req.body

  // Confirm data
  if (!username) {
    return res.status(400).json({ message: 'Username is required' })
  } else if (!password) {
    return res.status(400).json({ message: 'Password is required' })
  }

  // Check for duplicate
  const duplicate = await User.findOne({
    username: username,
  })
    .collation({ locale: 'en', strength: 2 })
    .lean()
    .exec()

  if (duplicate) {
    return res.status(409).json({ message: 'Duplicate username' })
  }

  // Hash password
  const hashedPwd = await bcrypt.hash(password, 10) // salt rounds

  const userObject =
    !Array.isArray(roles) || !roles.length
      ? { username, password: hashedPwd }
      : { username, password: hashedPwd, roles }

  //Create and store new user
  const user = await User.create(userObject)

  if (user) {
    // Created
    res.status(201).json({ message: `New user ${username} created` })
  } else {
    res.status(400).json({ message: 'Invalid user data received' })
  }
}

// @desc Update user
// @route PATCH /users
// @access Private
export const updateUser = async (req, res) => {
  const { id, username, roles, active, password } = req.body

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: 'ID is required' })
  } else if (!username) {
    return res.status(400).json({ message: 'Username is required' })
  } else if (!Array.isArray(roles)) {
    return res.status(400).json({ message: 'Incorrect role format' })
  } else if (!roles.length) {
    return res.status(400).json({ message: 'A role(s) is required' })
  } else if (typeof active !== 'boolean') {
    return res
      .status(400)
      .json({ message: 'Incorrect format for or missing active status' })
  }

  const user = await User.findById(id).exec()

  if (!user) {
    res.status(400).json({ message: 'User not found' })
  }

  // Check for duplicate
  const duplicate = await User.findOne({
    username: username,
  })
    .collation({ locale: 'en', strength: 2 })
    .lean()
    .exec()

  // Allow updates to the original user
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: 'Duplicate username' })
  }

  user.username = username
  user.roles = roles
  user.active = active

  if (password) {
    // Has password
    user.password = await bcrypt.hash(password, 10) // salt rounds
  }

  const updatedUser = await user.save()

  res.json({ message: `${updatedUser.username} updated` })
}

// @desc Delete user
// @route DELETE /users
// @access Private
export const deleteUser = async (req, res) => {
  const { id } = req.body

  if (!id) {
    return res.status(200).json({ message: 'User ID Required' })
  }

  const note = await Note.findOne({ user: id }).lean().exec()

  if (note) {
    return res.status(400).json({ message: 'User has assigned notes' })
  }

  const user = await User.findById(id).exec()

  if (!user) {
    res.status(400).json({ message: 'User not found' })
  }

  const result = await user.deleteOne()

  const reply = `Username ${result.username} with ID ${result._id} deleted`

  res.json(reply)
}
