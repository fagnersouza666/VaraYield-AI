import { useForm as useReactHookForm, UseFormProps, FieldValues, Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCallback, useMemo, useState } from 'react';

interface UseFormOptions<T extends FieldValues> extends Omit<UseFormProps<T>, 'resolver'> {
  schema?: z.ZodSchema<T>;
  onSubmit?: (data: T) => Promise<void> | void;
}

export const useForm = <T extends FieldValues>({
  schema,
  onSubmit,
  ...options
}: UseFormOptions<T>) => {
  const form = useReactHookForm<T>({
    ...options,
    resolver: schema ? zodResolver(schema) : undefined,
  });

  const handleSubmit = useCallback(
    (onValid?: (data: T) => void | Promise<void>, onInvalid?: (errors: any) => void) => {
      if (onSubmit) {
        return form.handleSubmit(async (data) => {
          try {
            await onSubmit(data);
            if (onValid) {
              await onValid(data);
            }
          } catch (error) {
            console.error('Form submission error:', error);
            throw error;
          }
        }, onInvalid);
      }
      
      return form.handleSubmit(onValid || (() => {}), onInvalid);
    },
    [form, onSubmit]
  );

  const getFieldProps = useCallback(
    (name: Path<T>) => ({
      ...form.register(name),
      error: form.formState.errors[name]?.message as string | undefined,
      invalid: !!form.formState.errors[name],
    }),
    [form]
  );

  const isValid = useMemo(() => form.formState.isValid, [form.formState.isValid]);
  const isDirty = useMemo(() => form.formState.isDirty, [form.formState.isDirty]);
  const isSubmitting = useMemo(() => form.formState.isSubmitting, [form.formState.isSubmitting]);

  return {
    ...form,
    handleSubmit,
    getFieldProps,
    isValid,
    isDirty,
    isSubmitting,
    hasErrors: Object.keys(form.formState.errors).length > 0,
  };
};

// Hook for async form validation
export const useAsyncForm = <T extends FieldValues>(
  options: UseFormOptions<T> & {
    validateAsync?: (data: T) => Promise<string | undefined>;
  }
) => {
  const { validateAsync, ...formOptions } = options;
  const form = useForm(formOptions);

  const handleAsyncSubmit = useCallback(
    async (data: T) => {
      if (validateAsync) {
        const validationError = await validateAsync(data);
        if (validationError) {
          form.setError('root', { 
            type: 'manual', 
            message: validationError 
          });
          return;
        }
      }
      
      if (formOptions.onSubmit) {
        await formOptions.onSubmit(data);
      }
    },
    [validateAsync, formOptions.onSubmit, form]
  );

  return {
    ...form,
    handleAsyncSubmit: form.handleSubmit(handleAsyncSubmit),
  };
};

// Hook for multi-step forms
export const useMultiStepForm = <T extends FieldValues>(
  steps: Array<{
    name: string;
    schema?: z.ZodSchema<Partial<T>>;
    fields: (keyof T)[];
  }>,
  options?: UseFormOptions<T>
) => {
  const form = useForm(options);
  const [currentStep, setCurrentStep] = useState(0);

  const currentStepConfig = steps[currentStep];
  
  const validateCurrentStep = useCallback(async () => {
    if (!currentStepConfig.schema) return true;
    
    const stepData = currentStepConfig.fields.reduce((acc, field) => {
      acc[field] = form.getValues(field as Path<T>);
      return acc;
    }, {} as Record<keyof T, any>);
    
    try {
      currentStepConfig.schema.parse(stepData);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          const fieldName = err.path[0] as Path<T>;
          form.setError(fieldName, { message: err.message });
        });
      }
      return false;
    }
  }, [currentStep, currentStepConfig, form]);

  const nextStep = useCallback(async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
    return isValid;
  }, [currentStep, steps.length, validateCurrentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step);
    }
  }, [steps.length]);

  return {
    ...form,
    currentStep,
    currentStepConfig,
    totalSteps: steps.length,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === steps.length - 1,
    nextStep,
    prevStep,
    goToStep,
    validateCurrentStep,
  };
};