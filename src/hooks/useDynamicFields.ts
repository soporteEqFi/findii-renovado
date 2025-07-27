import { useState, useEffect } from 'react';
import { getCreditTypes } from '../services/creditTypeService';

export const useDynamicFields = () => {
  const [creditTypeFields, setCreditTypeFields] = useState<any[]>([]);
  const [dynamicFieldValues, setDynamicFieldValues] = useState<Record<string, any>>({});
  const [availableCreditTypes, setAvailableCreditTypes] = useState<any[]>([]);

  const loadCreditTypes = async (selectedType?: string) => {
    try {
      const cedula = localStorage.getItem('cedula') || '';
      const data = await getCreditTypes(cedula);
      
      setAvailableCreditTypes(data);

      if (selectedType) {
        const selectedCreditType = data.find((type: any) => 
          type.name === `credito_${selectedType}`
        );
        
        if (selectedCreditType) {
          setCreditTypeFields(selectedCreditType.fields);
          const initialValues = selectedCreditType.fields.reduce((acc: any, field: any) => {
            acc[field.name] = '';
            return acc;
          }, {});
          setDynamicFieldValues(initialValues);
        } else {
          setCreditTypeFields([]);
          setDynamicFieldValues({});
        }
      }
    } catch (error) {
      console.error('Error al cargar los tipos de crédito:', error);
    }
  };

  const handleDynamicFieldChange = (fieldName: string, value: any) => {
    setDynamicFieldValues(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const updateFieldsForCreditType = (creditTypeName: string) => {
    const selectedType = availableCreditTypes.find(
      (type: any) => type.name === `credito_${creditTypeName}`
    );
    
    if (selectedType) {
      setCreditTypeFields(selectedType.fields);
      const initialValues = selectedType.fields.reduce((acc: any, field: any) => {
        acc[field.name] = '';
        return acc;
      }, {});
      setDynamicFieldValues(initialValues);
    }
  };

  return {
    creditTypeFields,
    dynamicFieldValues,
    availableCreditTypes,
    loadCreditTypes,
    handleDynamicFieldChange,
    updateFieldsForCreditType,
  };
}; 