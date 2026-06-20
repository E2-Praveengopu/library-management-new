import bcrypt from "bcrypt";




export const hashPassword = async (password) =>{

    const hashedPassword = await bcrypt.hash(password,10);

    return hashedPassword
}


export const comparePassword = async (inputPassword,hashPassword) => {

const isMatch = await bcrypt.compare(inputPassword,hashPassword);

return isMatch;


}