import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../DashboardLayout';
import RootLayout from '../RootLayout';
import { useSelector } from 'react-redux';
import axios from 'axios';

const SalaryCalculationMaster = () => {
    const LabelCss = "text-[#000000] font-[500] text-[18px] text-nowrap";
    const InputCss = "border-[#000000] border-[1px] outline-none rounded-[8px] py-1 px-2 w-[100%]";
    const { companyName, companyId } = useSelector((state) => state.company);
    const active = "border-[4px] border-brand_b_color rounded-[20px] bg-[#F0F4F7] text-[20px] p-2 text-brand_color w-[20%]";
    const [employeeNames, setEmployeeNames] = useState([]);
    const BASE_URL = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("token")
    const newHeader = {
        "Authorization": `Bearer ${token}`
    }

    // Form Define
    const [formData, setFormData] = useState({
        year: 0,
        month: '',
        workingDays: 0,
        employeeName: '',
        payableDays: 0,
        payableAmount: 0,
        dailyAllowance: 0,
        HRA: 0,
        Travelling_Allowance: 0,
        Conveyance: 0,
        W_LA: 0,
        otherAmount: 0,
        overTime: 0,
        Special_Allowance: 0,
        Amount_Name_5: 0,
        Amount_Name_6: 0,
        Amount_Name_7: 0,
        Amount_Name_8: 0,
        Difference_Pay: 0,
        loan: 0,
        glwf: 0,
        employeePF: 0,
        employerPF: 0,
        professionalTax: 0,
        tds: 0,
        glwfEmployer: 0,
        esic: 0,
        employerESIC: 0,
        advance: 0,
        ac1: 0,
        ac2: 0,
        ac10: 0,
        ac21: 0,
        ac22: 0,
        otherDeductions: 0,
        familyPensionFund: 0,
        grossDeductions: 0,
        grossEarnings: 0,
        netAmount: 0,
        remarks: '',
    });

    const navigate = useNavigate();
    const location = useLocation();

    // Fetch month and year from query params on component mount
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const month = params.get('month') || ''; // Default to '' if not found
        const year = params.get('year') || 0; // Default to 0 if not found
        const workingDays = params.get('workingDays') || 0;

        setFormData(prevData => ({
            ...prevData,
            month,
            year: parseInt(year, 10), // Convert year to number
            workingDays
        }));
    }, [location.search]);

    // Handle input change and fetch value in form control
    const calculateGrossEarnings = (data) => {
        return (
            parseFloat(data.payableAmount || 0) +
            parseFloat(data.dailyAllowance || 0) +
            parseFloat(data.HRA || 0) +
            parseFloat(data.Travelling_Allowance || 0) +
            parseFloat(data.Conveyance || 0) +
            parseFloat(data.W_LA || 0) +
            parseFloat(data.otherAmount || 0) +
            parseFloat(data.overTime || 0) +
            parseFloat(data.Special_Allowance || 0) +
            parseFloat(data.Amount_Name_5 || 0) +
            parseFloat(data.Amount_Name_6 || 0) +
            parseFloat(data.Amount_Name_7 || 0) +
            parseFloat(data.Amount_Name_8 || 0) +
            parseFloat(data.Difference_Pay || 0)
        );
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prevData) => {
            const updatedData = { ...prevData, [name]: value };

            // Ensure payableDays does not exceed workingDays
            if (name === 'payableDays' && parseFloat(value) > parseFloat(updatedData.workingDays)) {
                updatedData.payableDays = updatedData.workingDays; // Reset to workingDays
                alert(`Payable Days cannot exceed Working Days (${updatedData.workingDays}).`); // Optional alert
            }

            // Calculate Payable Amount dynamically
            const payableDays = parseFloat(updatedData.payableDays || 0);
            const consolidatedPayRate = parseFloat(updatedData.Consolidated_Pay_Rate || 0);
            const payRate = parseFloat(updatedData.Pay_Rate || 0);

            const payableAmount = (consolidatedPayRate || payRate) * payableDays;

            // Calculate the gross earnings
            const grossEarnings =
                parseFloat(payableAmount || 0) +
                parseFloat(updatedData.dailyAllowance || 0) +
                parseFloat(updatedData.HRA || 0) +
                parseFloat(updatedData.Travelling_Allowance || 0) +
                parseFloat(updatedData.Conveyance || 0) +
                parseFloat(updatedData.W_LA || 0) +
                parseFloat(updatedData.otherAmount || 0) +
                parseFloat(updatedData.overTime || 0) +
                parseFloat(updatedData.Special_Allowance || 0) +
                parseFloat(updatedData.Amount_Name_5 || 0) +
                parseFloat(updatedData.Amount_Name_6 || 0) +
                parseFloat(updatedData.Amount_Name_7 || 0) +
                parseFloat(updatedData.Amount_Name_8 || 0) +
                parseFloat(updatedData.Difference_Pay || 0);

            // Calculate gross deductions
            const grossDeductions =
                parseFloat(updatedData.loan || 0) +
                parseFloat(updatedData.advance || 0) +
                parseFloat(updatedData.professionalTax || 0) +
                parseFloat(updatedData.tds || 0) +
                parseFloat(updatedData.glwf || 0) +
                parseFloat(updatedData.employeePF || 0) +
                parseFloat(updatedData.employerPF || 0) +
                parseFloat(updatedData.esic || 0) +
                parseFloat(updatedData.employerESIC || 0) +
                parseFloat(updatedData.glwfEmployer || 0) +
                parseFloat(updatedData.otherDeductions || 0) +
                parseFloat(updatedData.familyPensionFund || 0);

            const netAmount = grossEarnings - grossDeductions;

            // Calculate the total from specified fields
            const totalSalaryComponents =
                payableAmount +
                parseFloat(updatedData.dailyAllowance || 0) +
                parseFloat(updatedData.Travelling_Allowance || 0) +
                parseFloat(updatedData.Conveyance || 0) +
                parseFloat(updatedData.otherAmount || 0) +
                parseFloat(updatedData.overTime || 0) +
                parseFloat(updatedData.Special_Allowance || 0) +
                parseFloat(updatedData.Amount_Name_5 || 0) +
                parseFloat(updatedData.Amount_Name_6 || 0) +
                parseFloat(updatedData.Amount_Name_7 || 0) +
                parseFloat(updatedData.Difference_Pay || 0);

            // Calculate Employee PF capped at 15000
            const pfBase = totalSalaryComponents > 15000 ? 15000 : totalSalaryComponents; // Cap at 15000
            const employeePF = (pfBase * 12) / 100; // Calculate Employee PF using capped amount
            const employerPF = (pfBase * 8.33) / 100; // Calculate employerPF PF using capped amount
            const ac1 = ((pfBase * 0.12) + (pfBase * 0.0367)) / 100; // Calculate ac1 PF using capped amount
            const calculatedValue = (pfBase * 0.50) / 100; // Calculate initial value
            const ac2 = calculatedValue <= 75 ? 500 : calculatedValue; // Apply the condition
            const ac10 = (pfBase * 8.33) / 100;
            const finalValue = (pfBase * 0.50) / 100; // Calculate the initial value
            const ac21 = finalValue > 75 ? 500 : finalValue; // Set to 500 if ac21 exceeds 75


            // Update grossEarnings in formData
            return {
                ...updatedData,

                payableAmount: payableAmount || 0,
                grossEarnings: isNaN(grossEarnings) ? 0 : grossEarnings,
                grossDeductions: grossDeductions,
                netAmount: netAmount,
                employeePF: isNaN(employeePF) ? 0 : employeePF,// Ensure employeePF is a number
                employerPF: isNaN(employerPF) ? 0 : employerPF, // Ensure employerPF is a number
                ac1: isNaN(ac1) ? 0 : ac1, // Ensure ac1 is a number
                ac2: isNaN(ac2) ? 0 : ac2, // Ensure ac2 is a number
                ac10: isNaN(ac10) ? 0 : ac10, // Ensure ac10 is a number
                ac21: isNaN(ac21) ? 0 : ac21, // Ensure ac21 is a number
                ac22: 0, // Ensure ac21 is a number
            };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(formData);
        navigate('/providentFund');
    };

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await fetch(`${BASE_URL}/employee/employees/${companyId}`);
                const data = await response.json();

                if (response.ok) {
                    const employeeList = data.employees.map(emp => ({
                        id: emp._id,
                        name: emp.Name_on_Aadhar + ' ' + emp.Surname_Last_Name,
                        salaryDetails: emp.Employee_Salary,
                    }));
                    setEmployeeNames(employeeList);

                    // Set the first employee as the default selected employee
                    if (employeeList.length > 0) {
                        const firstEmployee = employeeList[0];
                        setFormData(prevData => ({
                            ...prevData,
                            employeeName: firstEmployee.name,

                            ...firstEmployee.salaryDetails,
                        }));
                        handleApiCalls(firstEmployee.id); // Fetch additional data
                    }
                } else {
                    console.error('Failed to fetch employees:', data.message);
                }
            } catch (error) {
                console.error('Error fetching employees:', error);
            }
        };

        fetchEmployees();
    }, [BASE_URL, companyId]);

    const handleEmployeeChange = (e) => {
        const selectedEmployeeName = e.target.value;
        const selectedEmployee = employeeNames.find(employee => employee.name === selectedEmployeeName);

        if (selectedEmployee) {
            setFormData(prevData => {
                const updatedData = {
                    ...prevData,
                    employeeName: selectedEmployee.name,
                    ...selectedEmployee.salaryDetails,
                };

                // Reset payableDays if it exceeds workingDays
                if (parseFloat(updatedData.payableDays) > parseFloat(updatedData.workingDays)) {
                    updatedData.payableDays = updatedData.workingDays;
                    alert(`Payable Days cannot exceed Working Days (${updatedData.workingDays}).`);
                }

                const payableDays = parseFloat(updatedData.payableDays || 0);
                const consolidatedPayRate = parseFloat(updatedData.Consolidated_Pay_Rate || 0);
                const payRate = parseFloat(updatedData.Pay_Rate || 0);
                const payableAmount = (consolidatedPayRate || payRate) * payableDays;

                const grossEarnings = calculateGrossEarnings(updatedData);

                return {
                    ...updatedData,
                    payableAmount: 0,
                    payableDays: 0,
                    grossEarnings: isNaN(grossEarnings) ? 0 : grossEarnings,
                };
            });
            handleApiCalls(selectedEmployee.id); // Fetch additional data for the selected employee
        }
    };

    // Inside handleApiCalls function
    const handleApiCalls = async (employeeId) => {
        try {
            // Prepare the payload for the first API call
            const newFormdata = {
                company_id: companyId,
            };

            // Make both API calls in parallel using Promise.all
            const [companyResponse, employeeResponse] = await Promise.all([
                // First API call with axios
                axios.post(`${BASE_URL}/v1/com/company/view`, newFormdata, { headers: newHeader }),

                // Second API call using fetch
                fetch(`${BASE_URL}/employee/${employeeId}`).then((res) => res.json()), // .json() is necessary for fetch to get the data
            ]);

            // Extract relevant data from both API responses
            const companyData = companyResponse?.data?.CompanyDetails[0];
            const employeeData = employeeResponse;

            // Log the results of both API calls
            console.log('Company Details:', companyData);
            console.log('Employee Details:', employeeData);

            // Conditional logic to set Employee PF
            if (companyData?.company_other_detail?.pf_indicator === 'Yes' && employeeData?.PF === 'yes') {
                // Calculate Payable Amount dynamically
                const payableDays = parseFloat(formData.payableDays || 0);
                const consolidatedPayRate = parseFloat(employeeData?.Employee_Salary?.Consolidated_Pay_Rate || 0);
                const payRate = parseFloat(employeeData?.Employee_Salary?.Pay_Rate || 0);

                const payableAmount = (consolidatedPayRate || payRate) * payableDays;
                // Calculate total from specified fields
                const totalSalaryComponents =
                    parseFloat(payableAmount || 0) +
                    parseFloat(formData.dailyAllowance || 0) +
                    parseFloat(formData.Travelling_Allowance || 0) +
                    parseFloat(formData.Conveyance || 0) +
                    parseFloat(formData.otherAmount || 0) +
                    parseFloat(formData.overTime || 0) +
                    parseFloat(formData.Special_Allowance || 0) +
                    parseFloat(formData.Amount_Name_5 || 0) +
                    parseFloat(formData.Amount_Name_6 || 0) +
                    parseFloat(formData.Amount_Name_7 || 0) +
                    parseFloat(formData.Difference_Pay || 0);

                const employeePF = (totalSalaryComponents * 12) / 100; // Calculate Employee PF using total
                console.log('Calculated Employee PF:', employeePF);

                // Update formData state with the calculated PF
                setFormData((prevData) => ({
                    ...prevData,
                    employeePF: employeePF || 0, // Set employeePF to 0 if calculation fails
                }));
            }

        } catch (error) {
            console.error('Error during API calls:', error);
        }
    };

    return (
        <RootLayout>
            <DashboardLayout>
                <section className='w-full p-5'>
                    <div className='w-[80%] text-white bg-brand_colors py-2 px-3 rounded flex gap-3 items-center '>
                        <h2 className='text-[20px] font-bold'>Add Calculation Master</h2>
                    </div>

                    <form onSubmit={handleSubmit} className='w-full flex flex-wrap gap-4 mb-3'>
                        {/* Year/Month */}
                        <div className='flex gap-5 w-[80%] mt-3'>
                            {companyName && (
                                <button className={active}>{companyName}</button>
                            )}
                            <div>
                                <label className={LabelCss}>Year</label>
                                <input className={`${InputCss} bg-gray-200`} type='text' name='year' value={formData.year} onChange={handleChange} readOnly />
                            </div>
                            <div>
                                <label className={LabelCss}>Month</label>
                                <input className={`${InputCss} bg-gray-200`} type='text' name='month' value={formData.month} onChange={handleChange} readOnly />
                            </div>

                            {/* Working Days */}
                            <div>
                                <label className={LabelCss}>Working Days</label>
                                <input className={`${InputCss} bg-gray-200`} type='number' min="0" name='workingDays' value={formData.workingDays} onChange={handleChange} readOnly />
                            </div>
                            {/* Employee Name */}
                            <div className='w-[%]'>
                                <label className={LabelCss}>Employee Name</label>
                                <select name="employeeName" value={formData.employeeName} onChange={handleEmployeeChange} className={InputCss}>
                                    <option value="">Select Employee</option>
                                    {employeeNames.map(employee => (
                                        <option key={employee.id} value={employee.name}>{employee.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className='w-[100%] flex gap-3'>
                            <div className='w-[50%]'>
                                {/* Title Section */}
                                <div className='w-[100%] text-white bg-brand_colors py-2 px-3 rounded flex gap-3 items-center'>
                                    <h2 className='text-[20px] font-bold'>Addition</h2>
                                </div>
                                {/* Main Content Section */}
                                <div className='w-[100%] flex gap-4 mt-1'>
                                    {/* Left Column - 50% */}
                                    <div className='w-[100%] flex flex-col gap-3'>
                                        {/* Payable Days */}
                                        <div className='flex flex-col gap-1 w-[100%]'>
                                            <label className={LabelCss}>Payable Days</label>
                                            <input className={InputCss} type='number'
                                                min="0" name='payableDays'
                                                value={formData.payableDays} onChange={handleChange} />

                                        </div>

                                        {/* Payable Amount */}
                                        <div className='flex flex-col gap-1 w-[100%]'>
                                            <label className={LabelCss}>Payable Amount</label>
                                            <input className={`${InputCss} bg-gray-200`} type='number' min="0" name='payableAmount' value={formData.payableAmount} onChange={handleChange} />
                                        </div>

                                        {/* Daily Allowance */}
                                        <div className='flex flex-col gap-1 w-[100%]'>
                                            <label className={LabelCss}>Daily Allowance</label>
                                            <input className={InputCss} type='number' min="0" name='dailyAllowance' value={formData.dailyAllowance} onChange={handleChange} />
                                        </div>

                                        {/* HRA */}
                                        <div className='flex flex-col gap-1 w-[100%]'>
                                            <label className={LabelCss}>HRA</label>
                                            <input className={InputCss} type='number' min="0" name='HRA' value={formData.HRA} onChange={handleChange} />
                                        </div>
                                    </div>
                                    <div className='w-[100%] flex flex-col gap-3'>
                                        {/* Travel Allowance */}
                                        <div className='flex flex-col gap-1 w-[100%]'>
                                            <label className={LabelCss}>Traveling Allowance</label>
                                            <input className={InputCss} type='number' min="0" name='Travelling_Allowance' value={formData.Travelling_Allowance} onChange={handleChange} />
                                        </div>

                                        {/* Conveyance */}
                                        <div className='flex flex-col gap-1 w-[100%]'>
                                            <label className={LabelCss}>Conveyance</label>
                                            <input className={InputCss} type='number' min="0" name='Conveyance' value={formData.Conveyance} onChange={handleChange} />
                                        </div>

                                        {/* WALA */}
                                        <div className='flex flex-col gap-1 w-[100%]'>
                                            <label className={LabelCss}>WALA</label>
                                            <input className={InputCss} type='number' min="0" name='W_LA' value={formData.W_LA} onChange={handleChange} />
                                        </div>

                                        {/* Other Amount */}
                                        <div className='flex flex-col gap-1 w-[100%]'>
                                            <label className={LabelCss}>Other Amount</label>
                                            <input className={InputCss} type='number' min="0" name='otherAmount' value={formData.otherAmount} onChange={handleChange} />
                                        </div>
                                    </div>

                                    {/* Right Column - 50% */}
                                    <div className='w-[100%] flex flex-col gap-3'>
                                        {/* Over Time */}
                                        <div className='flex flex-col gap-1 w-[100%]'>
                                            <label className={LabelCss}>Over Time</label>
                                            <input className={InputCss} type='number' min="0" name='overTime' value={formData.overTime} onChange={handleChange} />
                                        </div>

                                        {/* Special Allowance */}
                                        <div className='flex flex-col gap-1 w-[100%]'>
                                            <label className={LabelCss}>Special Allowance</label>
                                            <input className={InputCss} type='number' min="0" name='Special_Allowance' value={formData.Special_Allowance} onChange={handleChange} />
                                        </div>

                                        {/* Allowance 5 */}
                                        <div className='flex flex-col gap-1 w-[100%]'>
                                            <label className={LabelCss}>Allowance 5</label>
                                            <input className={InputCss} type='number' min="0" name='Amount_Name_5' value={formData.Amount_Name_5} onChange={handleChange} />
                                        </div>

                                        {/* Allowance 6 */}
                                        <div className='flex flex-col gap-1 w-[100%]'>
                                            <label className={LabelCss}>Allowance 6</label>
                                            <input className={InputCss} type='number' min="0" name='Amount_Name_6' value={formData.Amount_Name_6} onChange={handleChange} />
                                        </div>

                                    </div>
                                    {/* Right Column - 50% */}
                                    <div className='w-[100%] flex flex-col gap-3'>
                                        {/* Allowance 7 */}
                                        <div className='flex flex-col gap-1 w-[100%]'>
                                            <label className={LabelCss}>Allowance 7</label>
                                            <input className={InputCss} type='number' min="0" name='Amount_Name_7' value={formData.Amount_Name_7} onChange={handleChange} />
                                        </div>

                                        {/* Allowance 8 */}
                                        <div className='flex flex-col gap-1 w-[100%]'>
                                            <label className={LabelCss}>Allowance 8</label>
                                            <input className={InputCss} type='number' min="0" name='Amount_Name_8' value={formData.Amount_Name_8} onChange={handleChange} />
                                        </div>


                                        {/* Difference to Pay */}
                                        <div className='flex flex-col gap-1 w-[100%]'>
                                            <label className={LabelCss}>Diff. to Pay</label>
                                            <input className={InputCss} type='number' min="0" name='Difference_Pay' value={formData.Difference_Pay} onChange={handleChange} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='w-[50%]'>
                                {/* Title Section */}
                                <div className='w-[100%] text-white bg-brand_colors py-2 px-3 rounded flex gap-3 items-center'>
                                    <h2 className='text-[20px] font-bold'>Deductions</h2>
                                </div>

                                {/* Main Content Section */}
                                <div className='w-[100%] flex gap-4 mt-1'>
                                    {/* Left Column - 50% */}
                                    <div className='w-[100%] flex flex-col gap-3'>
                                        {/* Loan */}
                                        <div className='flex flex-col gap-1 w-[100%]'>
                                            <label className={LabelCss}>Loan</label>
                                            <input
                                                className={InputCss}
                                                type='number' min="0"
                                                name='loan'
                                                value={formData.loan}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        {/* Advance */}
                                        <div className='flex flex-col gap-1 w-[100%]'>
                                            <label className={LabelCss}>Advance</label>
                                            <input
                                                className={InputCss}
                                                type='number' min="0"
                                                name='advance'
                                                value={formData.advance}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        {/* Professional Tax */}
                                        <div className='flex flex-col gap-1 w-[100%]'>
                                            <label className={LabelCss}>Professional Tax</label>
                                            <input
                                                className={InputCss}
                                                type='number' min="0"
                                                name='professionalTax'
                                                value={formData.professionalTax}
                                                onChange={handleChange}
                                                readOnly
                                            />
                                        </div>

                                        {/* TDS */}
                                        <div className='flex flex-col gap-1 w-[100%]'>
                                            <label className={LabelCss}>TDS</label>
                                            <input
                                                className={InputCss}
                                                type='number' min="0"
                                                name='tds'
                                                value={formData.tds}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <div className='w-[100%] flex flex-col gap-3'>
                                        {/* Employee PF */}
                                        <div className='flex flex-col gap-1 w-[100%]'>
                                            <label className={LabelCss}>Employee PF</label>
                                            <input
                                                className={InputCss}
                                                type='number' min="0"
                                                name='employeePF'
                                                value={formData.employeePF}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        {/* Employer PF */}
                                        <div className='flex flex-col gap-1 w-[100%]'>
                                            <label className={LabelCss}>Employer PF</label>
                                            <input
                                                className={InputCss}
                                                type='number' min="0"
                                                name='employerPF'
                                                value={formData.employerPF}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        {/* GLWF */}
                                        <div className='flex flex-col gap-1 w-[100%]'>
                                            <label className={LabelCss}>GLWF</label>
                                            <input
                                                className={InputCss}
                                                type='number' min="0"
                                                name='glwf'
                                                value={formData.glwf}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        {/* GLWF Employer */}
                                        <div className='flex flex-col gap-1 w-[100%]'>
                                            <label className={LabelCss}>GLWF Employer</label>
                                            <input
                                                className={InputCss}
                                                type='number' min="0"
                                                name='glwfEmployer'
                                                value={formData.glwfEmployer}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    {/* Right Column - 50% */}
                                    <div className='w-[100%] flex flex-col gap-3'>
                                        {/* ESIC */}
                                        <div className='flex flex-col gap-1 w-[100%]'>
                                            <label className={LabelCss}>ESIC</label>
                                            <input
                                                className={InputCss}
                                                type='number' min="0"
                                                name='esic'
                                                value={formData.esic}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        {/* Employer ESIC */}
                                        <div className='flex flex-col gap-1 w-[100%]'>
                                            <label className={LabelCss}>Employer ESIC</label>
                                            <input
                                                className={InputCss}
                                                type='number' min="0"
                                                name='employerESIC'
                                                value={formData.employerESIC}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        {/* AC 1 */}
                                        <div className='flex flex-col gap-1 w-[100%]'>
                                            <label className={LabelCss}>AC 1</label>
                                            <input
                                                className={InputCss}
                                                type='number' min="0"
                                                name='ac1'
                                                value={formData.ac1}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        {/* AC 2 */}
                                        <div className='flex flex-col gap-1 w-[100%]'>
                                            <label className={LabelCss}>AC 2</label>
                                            <input
                                                className={InputCss}
                                                type='number' min="0"
                                                name='ac2'
                                                value={formData.ac2}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <div className='w-[100%] flex flex-col gap-3'>
                                        {/* AC 10 */}
                                        <div className='flex flex-col gap-1 w-[100%]'>
                                            <label className={LabelCss}>AC 10</label>
                                            <input
                                                className={InputCss}
                                                type='number' min="0"
                                                name='ac10'
                                                value={formData.ac10}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        {/* AC 21 */}
                                        <div className='flex flex-col gap-1 w-[100%]'>
                                            <label className={LabelCss}>AC 21</label>
                                            <input
                                                className={InputCss}
                                                type='number' min="0"
                                                name='ac21'
                                                value={formData.ac21}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        {/* AC 22 */}
                                        <div className='flex flex-col gap-1 w-[100%]'>
                                            <label className={LabelCss}>AC 22</label>
                                            <input
                                                className={InputCss}
                                                type='number' min="0"
                                                name='ac22'
                                                value={formData.ac22}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        {/* Other Deductions */}
                                        <div className='flex flex-col gap-1 w-[100%]'>
                                            <label className={LabelCss}>Other Deductions</label>
                                            <input
                                                className={InputCss}
                                                type='number' min="0"
                                                name='otherDeductions'
                                                value={formData.otherDeductions}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        {/* Family Pension Fund */}
                                        <div className='flex flex-col gap-1 w-[100%]'>
                                            <label className={LabelCss}>FPF</label>
                                            <input
                                                className={InputCss}
                                                type='number' min="0"
                                                name='familyPensionFund'
                                                value={formData.familyPensionFund}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='w-[50%]'>
                                <div className='w-[100%] text-white bg-brand_colors py-2 px-3 rounded flex gap-3 items-center'>
                                    <h2 className='text-[20px] font-bold'>Total Calculation</h2>
                                </div>
                                {/* Gross Deductions */}
                                <div className='w-[100%]'>
                                    <label className={LabelCss}>Gross Deductions</label>
                                    <input
                                        className={`${InputCss} bg-gray-200`}
                                        type='number' min="0"
                                        name='Gross Deductions'
                                        value={formData.grossDeductions}
                                        onChange={handleChange}
                                    />
                                </div>
                                {/* Gross Salary */}
                                <div className='w-[100%]'>
                                    <label className={LabelCss}>Gross Earning</label>
                                    <input
                                        className={`${InputCss} bg-gray-200`} // make it read-only
                                        type='number' min="0"
                                        name='grossEarnings'
                                        value={formData.grossEarnings}
                                        readOnly
                                    />
                                </div>

                                {/* Net Amount */}
                                <div className='w-[100%]'>
                                    <label className={LabelCss}>Net Amount</label>
                                    <input
                                        className={`${InputCss} bg-gray-200`} // make it read-only
                                        type='number' min="0"
                                        name='netAmount'
                                        value={formData.netAmount}
                                        readOnly
                                    />
                                </div>
                                {/* Save and Clear buttons */}
                                <button className='bg-brand_colors text-white px-4 py-2 rounded hover:bg-opacity-80 mt-3 mr-3' type='submit'>Save</button>
                                <button className='bg-gray-500 text-white px-4 py-2 rounded mt-3' type='reset'>Clear</button>
                            </div>
                        </div>
                    </form>
                </section>
            </DashboardLayout>
        </RootLayout >
    );
};

export default SalaryCalculationMaster;
