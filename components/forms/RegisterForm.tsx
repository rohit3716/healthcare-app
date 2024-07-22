"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { number, z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl } from "@/components/ui/form";
import CustomFormField from "../CustomFormField";
import SubmitButton from "../SubmitButton";
import { useState } from "react";
import { PatientFormValidation, UserFormValidation } from "@/lib/validation";
import { useRouter } from "next/navigation";
import { createUser, registerPatient } from "@/lib/actions/patient.actions";
import { FormFieldType } from "./PatientForm";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Doctors, GenderOptions, IdentificationTypes, PatientFormDefaultValues } from "@/constants";
import { Label } from "../ui/label";
import { SelectItem } from "../ui/select";
import Image from "next/image";
import FileUploader from "../FileUploader";

const RegisterForm = ({ user }: { user: User }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof PatientFormValidation>>({
    resolver: zodResolver(PatientFormValidation),
    defaultValues: {
      ...PatientFormDefaultValues,
      name: user ? user.name : "",
      email: user ? user.email : "",
      phone: user ? user.phone : "",
    },
  });

  async function onSubmit(values: z.infer<typeof PatientFormValidation>) {
    setIsLoading(true);
    // console.log("Values: ", values.identificationDocument);
    
    let formData;

    if( values.identificationDocument && values.identificationDocument.length > 0 ){
      const blobFile = new Blob([values.identificationDocument[0]], {
        type: values.identificationDocument[0].type,
      })
      // console.log("blobFile: ", blobFile);
      
      formData = new FormData();
      // console.log("formData constructor: ", formData);
      
      formData.append('blobFile', blobFile);
      formData.append('fileName', values.identificationDocument[0].name)
    }

   


    try {
      const patientData = {
        ...values,
        userId:user.$id,
        birthDate: new Date(values.birthDate),
        identificationDocument:formData,
      }
      // console.log("patientData: ",patientData);
      // @ts-ignore
      const patient = await registerPatient(patientData);
      
      

      if( patient ) router.push(`/patients/${user.$id}/new-appointment`)
    } catch (error) {
      console.log(" Unable to register user: " ,error);
      
    }
    setIsLoading(false);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-12 flex-1"
      >
        <section className=" space-y-4">
          <h1 className=" header">Welcome 👋</h1>
          <p className=" text-dark-700">Let us know more about yourself.</p>
        </section>
        <section className=" space-y-6">
          <div className=" mb-9 space-y-1">
            <h2 className=" sub-header"> Personal Information</h2>
          </div>
        </section>
        <CustomFormField
          fieldType={FormFieldType.INPUT}
          control={form.control}
          label="Full Name"
          name="name"
          placeholder="ex: Adam"
          iconAlt="user"
          iconSrc="/assets/icons/user.svg"
        />

        <div className=" flex flex-col gap-6 xl:flex-row">
          <CustomFormField
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name="email"
            label="Email address"
            placeholder="John@gmail.com"
            iconSrc="/assets/icons/email.svg"
            iconAlt="user"
          />
          <CustomFormField
            fieldType={FormFieldType.PHONE_INPUT}
            control={form.control}
            name="phone"
            label="Phone number"
            placeholder="(555) 123-4567"
            iconSrc="/assets/icons/email.svg"
            iconAlt="user"
          />
        </div>

        <div className=" flex flex-col gap-6 xl:flex-row">
          <CustomFormField
            fieldType={FormFieldType.DATE_PICKER}
            control={form.control}
            name="birthDate"
            label="Date of Birth"
          />
          <CustomFormField
            fieldType={FormFieldType.SKELETON}
            control={form.control}
            name="gender"
            label="Gender"
            renderSkeleton={(field) => (
              <FormControl>
                <RadioGroup
                  className=" flex h-11 gap-6 xl:justify-between"
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  {GenderOptions.map((option) => (
                    <div key={option} className=" radio-group">
                      <RadioGroupItem value={option} id={option} />
                      <Label htmlFor={option} className=" cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
            )}
          />
        </div>

        <div className=" flex flex-col gap-6 xl:flex-row">
          <CustomFormField
            fieldType={FormFieldType.INPUT}
            control={form.control}
            label="Address"
            name="address"
            placeholder="ex: 14 street, New York, NY-5101"
          />
          <CustomFormField
            fieldType={FormFieldType.INPUT}
            control={form.control}
            label="Occupation"
            name="occupation"
            placeholder="ex: Business"
          />
        </div>

        <div className=" flex flex-col gap-6 xl:flex-row">
          <CustomFormField
            fieldType={FormFieldType.INPUT}
            control={form.control}
            label="Emergency Contact Name"
            name="emergencyContactName"
            placeholder="Guardian's Name"
          />
          <CustomFormField
            fieldType={FormFieldType.PHONE_INPUT}
            control={form.control}
            label="Emergency Contact Numbe  r"
            name="emergencyContactNumber"
            placeholder="(555) 123-4567"
          />
        </div>

        <section className=" space-y-6">
          <div className=" mb-9 space-y-1">
            <h2 className=" sub-header">Medical Information</h2>
          </div>
        </section>

        <CustomFormField
          fieldType={FormFieldType.SELECT}
          control={form.control}
          label="Primary Physician"
          name="primaryPhysician"
          placeholder="Select a Physician"
        >
          {Doctors.map((doctor) => (
            <SelectItem key={doctor.name} value={doctor.name}>
              <div className=" flex cursor-pointer items-center gap-2">
                <Image
                  src={doctor.image}
                  width={32}
                  height={32}
                  alt={doctor.name}
                  className=" rounded-full border border-dark-500"
                />
                <p>{doctor.name}</p>
              </div>
            </SelectItem>
          ))}
        </CustomFormField>

        <div className=" flex flex-col gap-6 xl:flex-row">
          <CustomFormField
            fieldType={FormFieldType.INPUT}
            control={form.control}
            label="Insurance Provider"
            name="insuranceProvider"
            placeholder="ex: BlueCross"
          />
          <CustomFormField
            fieldType={FormFieldType.INPUT}
            control={form.control}
            label="Insurance Policy Number"
            name="insurancePolicyNumber"
            placeholder="ex: ABC1232434"
          />
        </div>

        <div className=" flex flex-col gap-6 xl:flex-row">
          <CustomFormField
            fieldType={FormFieldType.TEXTAREA}
            control={form.control}
            label="Allergies (if any)"
            name="allergies"
            placeholder="ex: Peanuts, Penicillin, Pollen"
          />
          <CustomFormField
            fieldType={FormFieldType.TEXTAREA}
            control={form.control}
            label="Current Medications"
            name="currentMedications"
            placeholder="ex: Ibuprofen 200mg, Levothyroxine 50mcg"
          />
        </div>

        <div className=" flex flex-col gap-6 xl:flex-row">
          <CustomFormField
            fieldType={FormFieldType.TEXTAREA}
            control={form.control}
            label="Family Medical History (if relevant)"
            name="familyMedicalHistory"
            placeholder="ex: Mother had breast cancer"
          />
          <CustomFormField
            fieldType={FormFieldType.TEXTAREA}
            control={form.control}
            label="Past Medical History"
            name="pastMediclHistory"
            placeholder="ex: Asthma diagnosis in childhood"
          />
        </div>

        <section className=" space-y-6">
          <div className=" mb-9 space-y-1">
            <h2 className=" sub-header">Identification and Verification</h2>
          </div>
        </section>

        <CustomFormField
          fieldType={FormFieldType.SELECT}
          control={form.control}
          label="Identification type"
          name="identificationType"
          placeholder="Select a Physician"
        >
          {IdentificationTypes.map((type) => (
            <SelectItem key={type} value={type}>
              {type}
            </SelectItem>
          ))}
        </CustomFormField>

        <CustomFormField
          fieldType={FormFieldType.INPUT}
          control={form.control}
          label="Identification Number"
          name="identificationNumber"
          placeholder="ex: 1232434"
        />

        <CustomFormField
          fieldType={FormFieldType.SKELETON}
          control={form.control}
          name="identificationDocument"
          label="Scanned copy of Identification Document"
          renderSkeleton={(field) => (
            <FormControl>
              <FileUploader files={field.value} onChange={field.onChange} />
            </FormControl>
          )}
        />

        <section className=" space-y-6">
          <div className=" mb-9 space-y-1">
            <h2 className=" sub-header">Consent and Privacy</h2>
          </div>
        </section>
        <CustomFormField
          fieldType={FormFieldType.CHECKBOX}
          control={form.control}
          name="treatmentConsent"
          label="I consent to treatment"
        />
        <CustomFormField
          fieldType={FormFieldType.CHECKBOX}
          control={form.control}
          name="disclosureConsent"
          label="I consent to disclosure of information"
        />
        <CustomFormField
          fieldType={FormFieldType.CHECKBOX}
          control={form.control}
          name="privacyConsent"
          label="I consent to privacy policy"
        />
        <SubmitButton isLoading={isLoading}>Get Started</SubmitButton>
      </form>
    </Form>
  );
};

export default RegisterForm;
