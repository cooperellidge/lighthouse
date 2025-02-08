"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface NumberInputProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
}

export function NumberInput({ value, onChange, min = 1, max = 9999, step = 1 }: NumberInputProps) {
  const [inputValue, setInputValue] = useState(value.toString())

  useEffect(() => {
    setInputValue(value.toString())
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)

    if (newValue === "") {
      // Don't update the actual value yet, wait for blur
      return
    }

    const numberValue = Number(newValue)
    if (!isNaN(numberValue)) {
      onChange(Math.max(min, Math.min(max, numberValue)))
    }
  }

  const handleBlur = () => {
    if (inputValue === "") {
      // If empty, set to min value
      setInputValue(min.toString())
      onChange(min)
    } else {
      // Ensure the value is within bounds
      const numberValue = Number(inputValue)
      const boundedValue = Math.max(min, Math.min(max, numberValue))
      setInputValue(boundedValue.toString())
      onChange(boundedValue)
    }
  }

  const increment = () => onChange(Math.min(max, value + step))
  const decrement = () => onChange(Math.max(min, value - step))

  return (
    <div className="flex items-center justify-center">
      <Button
        onClick={decrement}
        variant="outline"
        className="w-10 px-0 py-0 text-base border-lighthouse-gold text-lighthouse-gold hover:bg-lighthouse-gold/10"
        aria-label="Decrease"
      >
        -
      </Button>
      <Input
        type="number"
        inputMode="numeric"
        pattern="[0-9]*"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        className="w-20 text-center mx-2 text-base font-mono text-lighthouse-gold border-lighthouse-gold focus-visible:ring-lighthouse-gold"
        min={min}
        max={max}
        step={step}
        style={{ fontSize: "16px" }}
        placeholder={min.toString()}
      />
      <Button
        onClick={increment}
        variant="outline"
        className="w-10 px-0 py-0 text-base border-lighthouse-gold text-lighthouse-gold hover:bg-lighthouse-gold/10"
        aria-label="Increase"
      >
        +
      </Button>
    </div>
  )
}

