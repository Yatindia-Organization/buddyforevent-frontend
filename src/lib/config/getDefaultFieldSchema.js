export function getDefaultFieldSchema(type) {
    const base = {
        id: crypto.randomUUID(),
        type,
        label: '',
        description: '',
        mandatory: true,
        invisible: false
    };

    switch (type) {
        case 'Input Field':
        case 'Email':
        case 'Textarea':
        case 'Number Field':
            return {
                ...base,
                maxLength: ''
            };

        case 'Select Menu':
            return {
                ...base,
                options: ['Option 1'],
                endPoint: false // Boolean toggle (checkbox in UI)
            };

        case 'Radio Button':
        case 'Checkbox':
            return {
                ...base,
                options: ['Option 1']
            };

        case 'URL':
            return {
                ...base,
                validationPattern: ''
            };

        case 'File Upload':
            return {
                ...base,
                acceptedFileTypes: '',
                maxSizeMB: ''
            };

        case 'Date':
            return {
                ...base,
                minDate: '',
                maxDate: ''
            };

        case 'Label':
            return {
                ...base,
                text: 'Label Content'
            };

        case 'Terms & Condition':
            return {
                ...base,
                text: 'Agree to our terms and conditions',
                isCheckedRequired: true
            };

        default:
            return base;
    }
}
