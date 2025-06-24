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
      return {
        ...base,
        label: '',
        maxLength: ''
      };

    case 'Email':
      return {
        ...base,
        label: 'email',
        maxLength: ''
      };

    case 'Phone Number':
      return {
        ...base,
        label: 'number',
        maxLength: ''
      };

    case 'Textarea':
      return {
        ...base,
        maxLength: ''
      };

    case 'Number Field':
      return {
        ...base,
        maxLength: ''
      };

    case 'Select Menu':
      return {
        ...base,
        options: ['Option 1'],
        endPoint: false
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

    case 'Custom ID':
      return {
        ...base,
        label: 'custom id'
      };

    default:
      return base;
  }
}
