import React, { useContext, useRef, useState } from 'react';
import { AuthContext } from '../../context/Authcontext';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import Logo from '../components/Logo';

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
    <div className='min-h-screen bg-cover bg-center flex items-center justify-center gap-10 sm:justify-evenly
        max-sm:flex-col backdrop-blur-xl p-4'>

      <Logo size="xl" stacked withTagline />

      <form onSubmit={onSubmitHandler} className="border border-white/10 bg-white/5 backdrop-blur-xl
            text-white p-6 flex flex-col rounded-2xl shadow-2xl shadow-black/30 space-y-5 w-full max-w-sm sm:max-w-md" >

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
                  bg-white/8 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="cursor-pointer py-2.5 bg-gradient-to-r w-full from-indigo-500 via-violet-500 to-fuchsia-500 text-white rounded-xl text-lg font-medium mt-2 hover:brightness-110 active:scale-[0.99] transition shadow-lg shadow-violet-900/30"
          >
            Verify My Account
          </button>
        </div>
      </form>
    </div>
  );
};

export default Verify;
