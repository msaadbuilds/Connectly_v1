import React, { useContext, useState } from 'react';
import assets from '../assets/assets';
import { AuthContext } from '../../context/Authcontext';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [bio, setBio] = useState("");
    const [isDataSubmitted, setIsDataSubmitted] = useState(false);
    const { signup } = useContext(AuthContext);

    const navigate = useNavigate();

    const onSubmitHandler = async (event) => {
        event.preventDefault();

        if (!isDataSubmitted) {
            setIsDataSubmitted(true);
            return;
        }   

        if (bio) {
            signup({ fullName, email, password, bio });
            // navigate("/verify", { state: { email } });
        }
    };

    return (
        <div className='min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly
        max-sm:flex-col backdrop-blur-2xl p-4'>

            <img src={assets.logo_big} className='w-[min(50vw,280px)]' />

            <form onSubmit={onSubmitHandler} className="border border-gray-600 bg-gradient-to-r from-purple-400/17 to-violet-700/17
            text-white p-5 flex flex-col rounded-lg shadow-lg space-y-5 w-full max-w-sm sm:max-w-md">

                <h1 className='font-semibold text-3xl flex justify-between items-center'>
                    Create Account
                    {isDataSubmitted && (
                        <img
                            src={assets.arrow_icon}
                            onClick={() => setIsDataSubmitted(false)}
                            className='w-5 cursor-pointer'
                        />
                    )}
                </h1>

                {!isDataSubmitted && (
                    <>
                        <div className='flex flex-col'>
                            <label className='mb-1' htmlFor="Name">Name</label>
                            <input
                                onChange={(e) => setFullName(e.target.value)}
                                value={fullName}
                                id='Name'
                                type="text"
                                className='p-2.5 bg-white/12 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500'
                                placeholder='Enter your Name'
                                required
                            />
                        </div>
                        <div className='flex flex-col'>
                            <label className='mb-1' htmlFor="Email">Email</label>
                            <input
                                onChange={(e) => setEmail(e.target.value)}
                                value={email}
                                type="email"
                                id='Email'
                                className='p-2.5 bg-white/12 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500'
                                placeholder='Enter your Email'
                                required
                            />
                        </div>
                        <div className='flex flex-col'>
                            <label className='mb-1' htmlFor="pass">Password</label>
                            <input
                                onChange={(e) => setPassword(e.target.value)}
                                value={password}
                                type="password"
                                id='pass'
                                className='p-2.5 bg-white/12 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500'
                                placeholder='Enter your Password'
                                required
                            />
                        </div>
                    </>
                )}

                {isDataSubmitted && (
                    <textarea
                        onChange={(e) => setBio(e.target.value)}
                        value={bio}
                        rows={4}
                        className='p-2.5 bg-white/12 rounded-lg focus:outline-none focus:border-none  focus:ring-2 focus:ring-indigo-500'
                        placeholder='Provide short bio...'
                        required
                    ></textarea>
                )}

                <button
                    type='submit'
                    className='py-2.5 mt-2 text-xl font-medium bg-gradient-to-r from-purple-400 to-violet-600 rounded-lg cursor-pointer'
                >
                    Sign up
                </button>

                <div className='text-center text-gray-400'>
                    <p className='text-md'>
                        Already have an account?{' '}
                        <Link to="/login" className='font-medium text-violet-500 cursor-pointer'>
                            Login here
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default Signup;
