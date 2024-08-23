import asyncHandler from "../middleware/asyncHandler.js";
import User from '../models/userModel.js';
import jwt from 'jsonwebtoken'
//import generateToken from "../utils/generateToken.js";

//@desc Auth user and get token
//@route POST/api/users/login
//@access Public
const authUser=asyncHandler(async(req,res)=>{
   const { email, password } = req.body;
    console.log('Email:', email);
    console.log('Password:', password);
    
    const user = await User.findOne({ email });
    console.log('User found:', user);
    
    if (user && (await user.matchPassword(password))) {
        const token =jwt.sign({userId:user._id}, process.env.JWT_SECRET,{
            expiresIn:'30d',
        });
        res.cookie('jwt', token,{
            httpOnly:true,
            secure:process.env.NODE_ENV !== 'development',
            sameSite:'strict',
            maxAge:30*24*60*60*1000
        })
        //generateToken(res, user._id);
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

//@desc Register user
//@route GET/api/users
//@access Public
const registerUser=asyncHandler(async(req,res)=>{
    /*const{name,email,password}=req.body;

    const userExists=await User.findOne({email});
    if (userExists){
        res.status(400);
        throw new Error('Usuario ya existe');
    }
    const user=await User.create({
        name,
        email,
        password,
    });
    if(user){
        generateToken(res,user._id); 

        res.status(201).json({
            _id:user._id,
            name:user.name,
            email:user.email,
            isAdmin:user.isAdmin,
        });
    }else{
        res.status(400);
        throw new Error('Datos del usuario inválidos')
    }*/
        res.send('Register user');
});



//@desc Logout user-clear cookie
//@route GET/api/users
//@access Private
const logoutUser=asyncHandler(async(req,res)=>{
    res.cookie('jwt','',{
        httpOnly:true,
        expires:new Date(0),
    });

    res.status(200).json({message:'Logged out succesfully'});
});


//@desc Get user profile
//@route GET/api/users/profile
//@access Private
const getUserProfile=asyncHandler(async(req,res)=>{
   /* const user=await User.findById(req.user._id);
    if(user){
        res.status(200).json({
            _id:user._id,
            name:user.name,
            email:user.email,
            isAdmin:user.isAdmin,
        });
    }else{
        res.status(404);
        throw new Error('User not found');
    }*/
        res.send('get user profile');
});

//@desc Update user profile
//@route PUT/api/users/profile
//@access Private
const updateUserProfile=asyncHandler(async(req,res)=>{
   /* const user=await User.findById(req.user._id);
    if(user){
        user.name=req.body.name || user.name;
        user.email=req.body.email || user.email;

        if(req.body.password){
            user.password=req.body.password;
        }
        const updateUser=await user.save();

        res.status(200).json({
            _id:updateUser._id,
            name:updateUser.name,
            email:updateUser.email,
            isAdmin:updateUser.isAdmin,
        });
    }else{
        res.status(404);
        throw new Error('Usuario no encontrado');
    }*/
        res.send('update user profile');
});

//@desc Get users
//@route GET/api/users
//@access Private/Admin
const getUsers=asyncHandler(async(req,res)=>{
    /*const users=await User.find({});
    res.status(200).json(users);*/
    res.send('get user');
});

//@desc Get user
//@route GET/api/user/:id
//@access Private/Admin
const getUserByID=asyncHandler(async(req,res)=>{
   /* const user=await User.findById(req.params.id).select('-password');
    if(user){
        res.status(200).json(user);
    }else{
        res.status(404);
        throw new Error('User not found');
    }*/
        res.send('get user id');
});


//@desc Delete user
//@route DELETE/api/users/:id
//@access Private/Admin
const deleteUser=asyncHandler(async(req,res)=>{
    /*const user=await User.findById(req.params.id);
    if(user){
        if(user.isAdmin){
            res.status(400);
            throw new Error('Cannot delete admin user');
        }
        await User.deleteOne({_id:user._id});
        res.status(200).json({message:'User deleted succesfully'});
    }else{
        res.status(404);
        throw new Error('User not found');
    }*/
        res.send('delete user');

});

//@desc Update user
//@route PUT/api/users/:id
//@access Private/Admin
const updateUser=asyncHandler(async(req,res)=>{
   /* const user=await User.findById(req.params.id);
    if(user){
        user.name=req.body.name || user.name;
        user.email=req.body.email || user.email;
        user.isAdmin=Boolean(req.body.isAdmin);

        const updatedUser=await user.save();

        res.status(200).json({
            _id:updatedUser._id,
            name:updatedUser.name,
            email:updatedUser.email,
            isAdmin:updatedUser.isAdmin,
        
        })

    }else{
        res.status(404);
        throw new Error('User not found');
    }*/
        res.send('update user');
});


export{
    authUser,
    registerUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
    getUsers,
    deleteUser,
    getUserByID,
    updateUser,
};

