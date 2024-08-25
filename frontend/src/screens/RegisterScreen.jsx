import { useState, useEffect } from "react";
import {Link, useLocation, useNavigate} from 'react-router-dom';
import { Form, Button,Row,Col} from "react-bootstrap";
import {useDispatch,useSelector} from 'react-redux';
import FormContainer from "../components/FormContainer.jsx";
import Loader from '../components/Loader.jsx';
import {useRegisterMutation} from '../slices/usersApiSlice.js';
import {setCredentials} from '../slices/authSlice.js';
import { toast } from "react-toastify";

const RegisterScreen =()=>{
    const [name,setName]=useState('')
    const [lastName,setlastName]=useState('')
    const [cardId,setcardId]=useState('')
    const [email,setEmail]=useState('')
    const [phoneNumber,setphoneNumber]=useState('')
    const [password,setPassword]=useState('')
    const [confirmPassword,setConfirmPassword]=useState('')


    const dispatch=useDispatch();
    const navigate=useNavigate();

    const [register,{isLoading}]=useRegisterMutation();

    const {userInfo}=useSelector((state)=>state.auth);

    const {search}=useLocation();
    
    const sp=new URLSearchParams(search);
    const redirect=sp.get('redirect') || '/';

    useEffect(()=>{
        if(userInfo){
            navigate(redirect);
        }
    },[userInfo,redirect,navigate]);


    const submitHandler= async(e)=>{
        e.preventDefault()
        if(password!==confirmPassword){
            toast.error('Passwords do not match');
            return;
        }else{
            try{
                const res= await register({name,lastName,cardId,email,phoneNumber,password}).unwrap();
                dispatch(setCredentials({...res,}));
                navigate(redirect);
            }catch(err){
                toast.error(err?.data?.message || err.error);
    
            }
        }
        
    };
    return(
        <FormContainer>
            <h1>Sign Up</h1>
            <Form onSubmit={submitHandler}>

            <Form.Group controlId="name" className="my-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
            type='text'
            placeholder="Ingrese su nombre"
            value={name}
            onChange={(e)=>setName(e.target.value)}>
                </Form.Control> 
            </Form.Group>
            <Form.Group controlId="lastName" className="my-3">
            <Form.Label>Apellido</Form.Label>
            <Form.Control
            type='text'
            placeholder="Ingrese su apellido"
            value={lastName}
            onChange={(e)=>setlastName(e.target.value)}>
                </Form.Control> 
            </Form.Group>

            <Form.Group controlId="cedula" className="my-3">
            <Form.Label>Cédula</Form.Label>
            <Form.Control
            type='text'
            placeholder="Ingrese su cédula"
            value={cardId}
            onChange={(e)=>setcardId(e.target.value)}>
                </Form.Control> 
            </Form.Group>

            <Form.Group controlId="email" className="my-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
            type='email'
            placeholder="Ingrese su email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}>
                </Form.Control> 
            </Form.Group>
            
            <Form.Group controlId="telefono" className="my-3">
            <Form.Label>Teléfono</Form.Label>
            <Form.Control
            type='text'
            placeholder="Ingrese su número de teléfono"
            value={phoneNumber}
            onChange={(e)=>setphoneNumber(e.target.value)}>
                </Form.Control> 
            </Form.Group>

            <Form.Group controlId="password" className="my-3">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control
            type='password'
            placeholder="Ingrese una contraseña"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}>
                </Form.Control> 
            </Form.Group>
            
            <Form.Group controlId="confirmPassword" className="my-3">
            <Form.Label>Confirmar contraseña</Form.Label>
            <Form.Control
            type='password'
            placeholder="Ingrese nuevamente la contraseña"
            value={confirmPassword}
            onChange={(e)=>setConfirmPassword(e.target.value)}>
                </Form.Control> 
            </Form.Group>


            <Button 
            type='submit' 
            variant='primary' 
            className="mt-2"
            disabled={isLoading}>
                Register
            </Button>
            {isLoading &&<Loader/>}
        </Form>
        <Row className="py-3">
            <Col>
                Already have an account? {''}
                 <Link to={redirect ? `/login?redirect=${redirect}`:'/login'}>
                    Login</Link>
            </Col>
        </Row>
</FormContainer>
   
  )
}
export default RegisterScreen