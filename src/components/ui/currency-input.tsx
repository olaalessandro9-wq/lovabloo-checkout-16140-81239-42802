import React, { useState, useEffect } from "react";
import { Input } from "./input";

interface CurrencyInputProps {
  value: string | number;  // Aceita centavos (number) ou string
  onChange: (value: number) => void;  // Retorna centavos (number)
  className?: string;
  error?: string;
  id?: string;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  className = "",
  error = "",
  id,
}) => {
  const [displayValue, setDisplayValue] = useState("R$ 0,00");

  // Formatar valor para exibição
  const formatCurrency = (cents: number): string => {
    const reais = Math.floor(cents / 100);
    const centavos = cents % 100;
    
    // Formatar com separador de milhares
    const reaisFormatted = reais.toLocaleString("pt-BR");
    const centavosFormatted = centavos.toString().padStart(2, "0");
    
    return `R$ ${reaisFormatted},${centavosFormatted}`;
  };

  // Converter string para centavos
  const parseCurrency = (str: string): number => {
    // Remover tudo exceto números
    const numbers = str.replace(/\D/g, "");
    return parseInt(numbers || "0", 10);
  };

  // Atualizar display quando value mudar
  useEffect(() => {
    const cents = typeof value === 'number' ? value : parseCurrency(value.toString());
    setDisplayValue(formatCurrency(cents));
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const key = e.key;

    // Permitir apenas números e teclas de controle
    if (
      !/^\d$/.test(key) && // Números
      key !== "Backspace" &&
      key !== "Delete" &&
      key !== "ArrowLeft" &&
      key !== "ArrowRight" &&
      key !== "Tab"
    ) {
      e.preventDefault();
      return;
    }

    // Prevenir comportamento padrão para números e backspace
    if (/^\d$/.test(key) || key === "Backspace" || key === "Delete") {
      e.preventDefault();

      let cents = parseCurrency(displayValue);

      if (/^\d$/.test(key)) {
        // Adicionar dígito (multiplicar por 10 e adicionar novo dígito)
        cents = cents * 10 + parseInt(key, 10);
      } else if (key === "Backspace" || key === "Delete") {
        // Remover último dígito (dividir por 10)
        cents = Math.floor(cents / 10);
      }

      onChange(cents);  // Retorna centavos diretamente
      setDisplayValue(formatCurrency(cents));
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    const numbers = pastedText.replace(/\D/g, "");
    
    if (numbers) {
      const cents = parseInt(numbers, 10);
      onChange(cents);  // Retorna centavos diretamente
      setDisplayValue(formatCurrency(cents));
    }
  };

  return (
    <Input
      id={id}
      type="text"
      value={displayValue}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      className={className}
      readOnly={false}
    />
  );
};

