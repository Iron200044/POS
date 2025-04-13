export interface User{
    name:string, 
    email: string, 
    password:string, 
    role:"Client" | "Chef" | "cashier",
}