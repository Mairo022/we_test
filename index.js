const EMPLOYER_COMPENSATION_START_DAY = 4
const EMPLOYER_COMPENSATION_END_DAY = 8
const INSURANCE_COMPENSATION_START_DAY = 9
const INSURANCE_COMPENSATION_END_DAY_NO_TUBERCULOSIS = 182
const INSURANCE_COMPENSATION_END_DAY_TUBERCULOSIS = 240
const COMPENSATION_RATE = 0.7
const INCOME_TAX = 0.22

const formCalculator = document.querySelector('#calc__form')
const calculatorIncome = document.querySelector('#calc__income')
const calculatorSickDays = document.querySelector('#calc__sick_days')
const calculatorTuberculosis = document.querySelector('#calc__tuberculosis')

calculatorIncome.addEventListener('input', ensureInputNotNegative)
calculatorSickDays.addEventListener('input', ensureInputNotNegative)

function ensureInputNotNegative(e) {
    if (e.target.value <= 0) e.target.value = 0
}

formCalculator.addEventListener('submit', onCalculateSubmit)

function onCalculateSubmit(e) {
    e.preventDefault()
    const income = parseFloat(calculatorIncome.value !== "" ? calculatorIncome.value : "0")
    const sickDays = parseInt(calculatorSickDays.value !== "" ? calculatorSickDays.value : "0" )
    const isTuberculosis = Boolean(calculatorTuberculosis.checked)

    const compensation = {
        employerDays: 0,
        employerSum: 0,
        insuranceDays: 0,
        insuranceSum: 0,
        compDaily: 0,
        days: sickDays
    }

    if (sickDays < EMPLOYER_COMPENSATION_START_DAY || income <= 0) {
        setCalculatorResults(compensation)
        return
    }

    const accuracyMultiplier = 100
    const compDaily = Math.floor(
        accuracyMultiplier * (income / 20) * COMPENSATION_RATE * (1 - INCOME_TAX)) / accuracyMultiplier

    const employerCompensationDays = Math.min(sickDays, EMPLOYER_COMPENSATION_END_DAY) - EMPLOYER_COMPENSATION_START_DAY + 1
    const employerCompensationSum = employerCompensationDays * compDaily

    compensation.employerDays = employerCompensationDays
    compensation.employerSum = employerCompensationSum
    compensation.compDaily = compDaily

    if (sickDays >= INSURANCE_COMPENSATION_START_DAY) {
        const insuranceCompensationDays = Math.min(
            sickDays - EMPLOYER_COMPENSATION_END_DAY,
            isTuberculosis
                ? INSURANCE_COMPENSATION_END_DAY_TUBERCULOSIS
                : INSURANCE_COMPENSATION_END_DAY_NO_TUBERCULOSIS)

        const insuranceCompensationSum = insuranceCompensationDays * compDaily

        compensation.insuranceDays = insuranceCompensationDays
        compensation.insuranceSum = insuranceCompensationSum
    }

    setCalculatorResults(compensation)
}

function setCalculatorResults(compensation) {
    const employerCompensationDays = document.querySelector("#employer_compensation_days")
    const employerCompensationSum = document.querySelector("#employer_compensation_total")
    const employerCompensationDaily = document.querySelector("#employer_compensation_daily")
    const insuranceCompensationDays = document.querySelector("#insurance_compensation_days")
    const insuranceCompensationSum = document.querySelector("#insurance_compensation_total")
    const insuranceCompensationDaily = document.querySelector("#insurance_compensation_daily")
    const compensationTotal = document.querySelector("#compensation_total")
    const compensationDays = document.querySelector("#compensation_days")

    employerCompensationDays.textContent = formatDays(compensation.employerDays)
    employerCompensationSum.textContent = formatCurrency(compensation.employerSum)
    employerCompensationDaily.textContent = formatCurrency(compensation.compDaily)

    insuranceCompensationDays.textContent = formatDays(compensation.insuranceDays)
    insuranceCompensationSum.textContent = formatCurrency(compensation.insuranceSum)
    insuranceCompensationDaily.textContent = formatCurrency(compensation.compDaily)

    compensationTotal.textContent = formatCurrency(compensation.employerSum + compensation.insuranceSum)
    compensationDays.textContent = formatDays(compensation.days)
}

function formatDays(value) {
    return `${value} days`
}

function formatCurrency(value) {
    return new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2
    }).format(value);
}
