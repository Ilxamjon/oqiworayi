import React, { forwardRef } from 'react';
import { Input } from './ui/Input';

const PhoneInput = forwardRef(({ value, onChange, ...props }, ref) => {
    const formatPhoneNumber = (input) => {
        // Faqat raqamlarni olish
        const numbers = input.replace(/\D/g, '');

        // 998 bilan boshlangan bo'lsa, uni olib tashlash (foydalanuvchi +998 ni o'zi kiritgan bo'lsa)
        let cleaned = numbers;
        if (cleaned.startsWith('998')) {
            cleaned = cleaned.substring(3);
        }

        // Maksimal 9 ta raqam (998 dan keyin)
        cleaned = cleaned.substring(0, 9);

        // Formatlash: +998 XX XXX XX XX
        let formatted = '+998';

        if (cleaned.length > 0) {
            formatted += ' ' + cleaned.substring(0, 2);
        }
        if (cleaned.length > 2) {
            formatted += ' ' + cleaned.substring(2, 5);
        }
        if (cleaned.length > 5) {
            formatted += ' ' + cleaned.substring(5, 7);
        }
        if (cleaned.length > 7) {
            formatted += ' ' + cleaned.substring(7, 9);
        }

        return formatted;
    };

    const handleChange = (e) => {
        const formatted = formatPhoneNumber(e.target.value);

        // onChange ni chaqirish
        if (onChange) {
            const syntheticEvent = {
                ...e,
                target: {
                    ...e.target,
                    value: formatted,
                    name: e.target.name
                }
            };
            onChange(syntheticEvent);
        }
    };

    return (
        <Input
            ref={ref}
            type="text"
            value={value || '+998'}
            onChange={handleChange}
            placeholder="+998 XX XXX XX XX"
            {...props}
        />
    );
});

PhoneInput.displayName = 'PhoneInput';

export default PhoneInput;
