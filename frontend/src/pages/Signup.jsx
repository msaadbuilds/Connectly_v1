import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/Authcontext';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

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
        <div className='min-h-screen bg-cover bg-center flex items-center justify-center gap-10 sm:justify-evenly
        max-sm:flex-col backdrop-blur-xl p-4'>

            <Logo size="xl" stacked withTagline />

            <form onSubmit={onSubmitHandler} className="border border-white/10 bg-white/5 backdrop-blur-xl
            text-white p-6 flex flex-col rounded-2xl shadow-2xl shadow-black/30 space-y-5 w-full max-w-sm sm:max-w-md">

                <h1 className='font-semibold text-3xl flex justify-between items-center'>
                    Create Account
                    {isDataSubmitted && (
                        <button
                            type='button'
                            onClick={() => setIsDataSubmitted(false)}
                            className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors cursor-pointer'
                        >
                            <svg className='w-4 h-4 text-white' fill='none' stroke='currentColor' strokeWidth='2.5' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' d='M10 19l-7-7m0 0l7-7m-7 7h18' />
                            </svg>
                        </button>
                    )}
                </h1>

                {!isDataSubmitted && (
                    <>
                        <div className='flex flex-col'>
                            <label className='mb-1 text-sm text-gray-300' htmlFor="Name">Name</label>
                            <input
                                onChange={(e) => setFullName(e.target.value)}
                                value={fullName}
                                id='Name'
                                type="text"
                                className='p-2.5 bg-white/8 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition'
                                placeholder='Enter your Name'
                                required
                            />
                        </div>
                        <div className='flex flex-col'>
                            <label className='mb-1 text-sm text-gray-300' htmlFor="Email">Email</label>
                            <input
                                onChange={(e) => setEmail(e.target.value)}
                                value={email}
                                type="email"
                                id='Email'
                                className='p-2.5 bg-white/8 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition'
                                placeholder='Enter your Email'
                                required
                            />
                        </div>
                        <div className='flex flex-col'>
                            <label className='mb-1 text-sm text-gray-300' htmlFor="pass">Password</label>
                            <input
                                onChange={(e) => setPassword(e.target.value)}
                                value={password}
                                type="password"
                                id='pass'
                                className='p-2.5 bg-white/8 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition'
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
                        className='p-2.5 bg-white/8 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition'
                        placeholder='Provide short bio...'
                        required
                    ></textarea>
                )}

                <button
                    type='submit'
                    className='py-2.5 mt-2 text-xl font-medium bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 rounded-xl cursor-pointer hover:brightness-110 active:scale-[0.99] transition shadow-lg shadow-violet-900/30'
                >
                    Sign up
                </button>

                <div className='text-center text-gray-400'>
                    <p className='text-md'>
                        Already have an account?{' '}
                        <Link to="/login" className='font-medium text-violet-400 hover:text-violet-300 cursor-pointer transition-colors'>
                            Login here
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default Signup;
