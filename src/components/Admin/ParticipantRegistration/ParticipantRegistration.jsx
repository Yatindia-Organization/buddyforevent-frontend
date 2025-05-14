import React from 'react'
import FormBuilder from '../DynamicFormBuilder/FormBuilder/FormBuilder'

export default function ParticipantRegistration() {
    return (
        <div className='flex flex-col gap-[1vw]'>
            <div className='flex justify-between'>
                <div className='w-auto'>
                    <h3>Event Registration</h3>
                    <p>You can create event registrations form and ticket registration count here for your event by drag and drop of at least one field</p>
                </div>
                <div className='flex gap-[2vw] hidden'>
                    <div className='w-[18vw] px-[1vw] flex flex-col gap-[0.2vw] py-[0.2vw] bg-white rounded-[0.4vw]'>
                        <p>ticket registration</p>
                        <div className='w-full h-[1vh] rounded-[2vw] bg-slate-600'></div>
                    </div>
                    <div className='w-[18vw] px-[1vw] flex flex-col gap-[0.2vw] py-[0.2vw] bg-white rounded-[0.4vw]'>
                        <p>User registration</p>
                        <div className='w-full h-[1vh] rounded-[2vw] bg-green-600'></div>
                    </div>
                </div>
            </div>
            <div className='w-full h-auto bg-white'>
                <FormBuilder />
            </div>
        </div>
    )
}
