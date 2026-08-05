import React, { useContext, useRef, useState } from 'react';
import assets from '../assets/assets';
import { AuthContext } from '../../context/Authcontext';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';

const Verify = () => {
  const [code, setCode] = useState(["", "", "", ""]);
  const inputRefs = useRef([]);
  const { verifyOTP } = useContext(AuthContext);
  const location = useLocation();
  const email = location.state?.email;


  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").slice(0, 4).split("");
    const newCode = [...code];
    pasted.forEach((char, i) => {
      if (i < 4 && /^\d$/.test(char)) newCode[i] = char;
    });
    setCode(newCode);
  };



  
  const onSubmitHandler = (event) => {
    event.preventDefault();
    console.log("click")
    const OTP = code.join("");
    if (OTP.length !== 4) {
      toast.error("Please enter the full 4-digit OTP");
      return;
    }
    verifyOTP({email, OTP})
    
  };

  return (
    <div className='min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly
        max-sm:flex-col backdrop-blur-2xl p-4'>

      <img src={assets.logo_big} className='w-[min(50vw,280px)]' alt="" />

      <form onSubmit={onSubmitHandler} className="border border-gray-600 bg-gradient-to-r from-purple-400/17 to-violet-700/17
            text-white p-5 flex flex-col rounded-lg shadow-lg space-y-5 w-full max-w-sm sm:max-w-md" >

        <div className="w-full h-full">
          <h2 className="text-2xl sm:text-4xl font-bold mb-2 text-center sm:text-left">Email Verification</h2>
          <p className="text-gray-400 mb-5 text-sm sm:text-base text-center sm:text-left">
            A verification code has been sent to your email. Please enter it below.
          </p>

          <div className="flex flex-col gap-3 justify-center mb-6">
            <div className='text-center'>
              <label className="text-md font-medium text-gray-200">
                Type your 4-digit security code
              </label>
            </div>

            <div className='w-full flex justify-center gap-3'>
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  maxLength="1"
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={handlePaste}
                  ref={(el) => (inputRefs.current[index] = el)}
                  className="w-14 h-12 sm:w-16 sm:h-12 font-semibold text-lg sm:text-2xl text-center
                  bg-white/12 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="cursor-pointer py-2.5 bg-gradient-to-r w-full from-purple-400 to-violet-600 text-white rounded-md text-lg font-medium mt-2"
          >
            Verify My Account
          </button>
        </div>
      </form>
    </div>
  );
};

export default Verify;
