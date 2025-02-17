/* eslint-disable react-hooks/exhaustive-deps */
// TODO: enable react exhaustive deeps and fix the errors in this file
// https://reactjs.org/docs/hooks-faq.html#what-can-i-do-if-my-effect-dependencies-change-too-often

import React, { useEffect, useMemo, useState } from 'react'
import _tw from 'twin.macro'
import ReactSelect, { Styles, ValueType } from 'react-select'
import Label from '@components/FormFields/Label'
import ErrorMessage from '@components/FormFields/ErrorMessage'
import { RefReturn } from '@components/FormFields/Input'

import {
  Control,
  Controller,
  FieldName,
  FieldValues,
  FieldErrors,
  FieldError,
  RegisterOptions,
} from 'react-hook-form'
import { isArrayOfStrings } from '@lib/utils/arrays'
import { capitalizeFirstLetter } from '@lib/utils/strings'

export const MIN_LENGTH_FOR_SEARCH = 40

export const customStyles: Partial<Styles<TOption, false>> = {
  control: (_, state) => ({
    ..._tw`bg-white flex items-center shadow-sm w-full text-sm leading-6 py-2 px-3 border rounded-md border-gray-300`,

    ...(state.hasValue && _tw`py-2`),

    ...(state.selectProps.hasError &&
      _tw`text-red-600 border-red-500 hover:border-red-500`),

    ...(state.isFocused &&
      _tw`outline-none ring-2 border-blue-400 ring-blue-400`),

    ...(state.isFocused &&
      state.selectProps.hasError &&
      _tw`border-red-500 ring-red-500`),
  }),
  option: (provided, state) => ({
    ...provided,
    ..._tw`text-gray-700 relative select-none hover:bg-gray-100 flex justify-between w-full pl-8 pr-4 py-2 text-sm leading-5 h-full text-left`,

    ...(state.isFocused && _tw`bg-gray-100`),

    ...(state.isSelected &&
      _tw`bg-gray-100 text-black font-semibold hover:bg-gray-200`),

    ...(state.isSelected && state.isFocused && _tw`bg-gray-200`),
  }),
  noOptionsMessage: (provided) => ({
    ...provided,
    ..._tw`text-gray-500`,
  }),
  input: (provided) => ({
    ...provided,
    ..._tw`border-0 ring-0 outline-none`,
  }),
  singleValue: (provided, state) => ({
    ...provided,
    ..._tw`px-0 m-0`,
    ...(state.selectProps.hasError && _tw`text-red-600`),
  }),
  placeholder: (provided) => ({
    ...provided,
    ..._tw`m-0 py-0 text-transparent sm:text-gray-500`,
  }),
  valueContainer: (provided) => ({
    ...provided,
    ..._tw`px-0 py-1`,
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    ..._tw`pr-0 py-0`,
  }),
  indicatorSeparator: (provided) => ({
    ...provided,
    ..._tw`m-0`,
  }),
  clearIndicator: (provided) => ({
    ...provided,
    ..._tw`py-0`,
  }),
}

export type TSelectProps = React.DetailedHTMLProps<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  HTMLSelectElement
>

export type TOption = {
  id?: string | number
  value?: string | number
  name?: string
  label?: string
  description?: string
}

export type TPossibleValues = TOption | null

export interface ISelectProps extends TSelectProps {
  name: string
  control: Control
  label?: string
  options?: TOption[] | string[] | null
  placeholder?: string
  validations?: RegisterOptions
  error?: FieldErrors | FieldError | undefined
  register: (setup: any, options: RegisterOptions) => RefReturn
  unregister(name: FieldName<FieldValues> | FieldName<FieldValues>[]): void
  initialValue?: TPossibleValues | string
  setFormValue: (
    name: FieldName<FieldValues>,
    value: unknown,
    config?:
      | Partial<{
          shouldValidate: boolean
          shouldDirty: boolean
        }>
      | undefined
  ) => void
  isSubmitClicked: boolean
}

export const formatOptions: (
  optionList?: TOption[] | string[] | undefined | null
) => TOption[] | undefined | null = (optionList) =>
  optionList && isArrayOfStrings(optionList)
    ? (optionList as string[]).map((opt) => ({
        id: opt,
        label: capitalizeFirstLetter(opt),
      }))
    : (optionList as TOption[] | undefined | null)

// CustomSelect built only for single values
const Select = ({
  label,
  name,
  options,
  error,
  control,
  placeholder,
  validations,
  register,
  unregister,
  initialValue = null,
  setFormValue,
  isSubmitClicked = false,
}: ISelectProps) => {
  const formattedOptions: TOption[] | undefined | null = useMemo(
    () => formatOptions(options),
    [options]
  )

  const formattedInitialValue: TPossibleValues =
    initialValue && typeof initialValue === 'string'
      ? {
          id: initialValue,
        }
      : (initialValue as TOption | null)

  const [selectedOption, setSelectedOption] = useState<
    ValueType<TOption, false>
  >(formattedInitialValue)

  const handleChange = (selected: TPossibleValues = null) => {
    setSelectedOption(selected)
  }

  useEffect(() => {
    register({ name, type: 'custom' }, { ...validations })
    return () => unregister(name)
  }, [name, register, unregister])

  useEffect(() => {
    const newOption = selectedOption
      ? {
          ...(selectedOption.id
            ? {
                id: selectedOption.id,
              }
            : {
                value: selectedOption.value,
              }),
        }
      : null

    setFormValue(name, newOption, {
      shouldValidate: isSubmitClicked,
    })
  }, [name, selectedOption, setFormValue])

  const handleOptionLabel = (option: TOption) => {
    const currentOption = formattedOptions?.find((opt) =>
      opt.id ? opt.id === option.id : opt.value === option.value
    )

    return `${
      currentOption?.name ?? currentOption?.label ?? currentOption?.description
    }`
  }

  return (
    <Label htmlFor={name} description={label}>
      <Controller
        name={name}
        control={control}
        defaultValue={selectedOption}
        render={({ name, ref }) => (
          <ReactSelect
            ref={ref}
            styles={customStyles}
            onChange={handleChange}
            options={formattedOptions || undefined}
            hasError={Boolean(error)}
            classNamePrefix="Select"
            menuPlacement="auto"
            value={selectedOption}
            placeholder={placeholder}
            aria-labelledby={name}
            getOptionLabel={handleOptionLabel}
            getOptionValue={(option: TOption) =>
              `${option['id'] ?? option['value']}`
            }
            isClearable={Boolean(!validations?.required)}
            isSearchable={Boolean(
              options && options.length >= MIN_LENGTH_FOR_SEARCH
            )}
          />
        )}
      />
      {Boolean(validations) && <ErrorMessage>{error?.message}</ErrorMessage>}
    </Label>
  )
}

export default Select
