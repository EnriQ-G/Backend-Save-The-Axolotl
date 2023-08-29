const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

const registerUser = asyncHandler(async (req, res) => {
    const {name, email, password} = req.body;
    if(!name || !email || !password){
        res.status(400);
        throw new Error('Todos los campos son requeridos');
    }
    const userExist = await User.findOne({email});
    if(userExist){
        res.status(400);
        throw new Error('El usuario ya existe');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        name,
        email,
        password: hashedPassword
    });

    if(user){
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email
        });
    } else {
        res.status(400);
        throw new Error('Datos inválidos');
    }

})

const loginUser = asyncHandler(async (req, res) => {
    const {email, password} = req.body;
    const userExist = User.findOne({email});

    if(userExist && (await bcrypt.compare(password, userExist.password))){
        const token = jwt.sign({id: userExist._id, name: userExist.name, email: userExist.email, isAdmin: userExist.isAdmin}, process.env.JWT_SECRET, {
            expiresIn: '30d'
        });
        res.status(200).json({
            _id: userExist._id,
            name: userExist.name,
            email: userExist.email,
            isAdmin: userExist.isAdmin,
            token
        });
    } else{
        res.status(400);
        throw new Error('Datos inválidos');
    }
    res.json({message: 'Login realizado'});
})

const getUserData = asyncHandler(async(req,res)=>{
    res.json(req.user)
})

module.exports = {
    registerUser,
    loginUser,
    getUserData
}