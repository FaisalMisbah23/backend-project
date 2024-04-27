import mongoose, {Schema}  from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const userSchema = new mongooose.Schema({
    watchHistrry : [
        {
            type : mongoose.Types.ObjectId,
            ref : 'Video' 
        }
    ],
    username : {
        type : String ,
        required : true ,
        trim : true , // trim  the string like 'hello ' , ' hello'  as 'hello'
        index : true  // best for add best searching functionality.
    },
    email : {
        type : String ,
        required : true ,
        trim : true ,
    },
    fullName : {
        type : String ,
        required : true ,
        trim : true ,
    },
    avatar : {
        type : String , // cloundianry url
        required : true ,
    },
    coverImage : {
        type : String , // cloundianry url
    },
    password : {
        type : String ,
        required : true
    },
    refreshToken : {
        type : String ,
        required : true
    },

},{timeStamps : true})
// Add pre middleware to this query instance. Doesn't affect other quer
userSchema.pre('save', async function(next) {
    // as arrow function did't accept this keywork so we use function
    // as the bcrypt can takes time so we use async-await
    // check if modified then again save passwork otherwise bcrypt everytime change passoword
    if(this.isModified('password')){
        this.password = bcrypt.hash(this.password, 8)
        next()
    } else {
        return next()
    }
   
} )

userSchema.methods.isPasswordCorrect = async function (password) {
    await bcrypt.compare(password,this.password)
}

userSchema.methods.genreteAcessToken = function() {
    return jwt.sign({
        _id:this._id,
        email:this.email,
        username:this.username,
        fullName:this.fullName
},
    Process.env.Access_Token_Secret,
    {expiresIn:Access_Token_Expiry}
)
}

userSchema.methods.genereteRefreshToken = function() {
    return jwt.sign({
        _id:this._id,
    },
    Refresh_Token_Secret,
    {expiresIn:Refresh_Token_Expiry}
    )
}


export const User = mongoose.model('User',userSchema)