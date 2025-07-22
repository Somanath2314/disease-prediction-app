import React, { useState } from 'react';
import axios from 'axios';
 

const API_BASE_URL = 'https://disease-predict-api-20320365612.asia-south1.run.app/';
const Predict = () => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [formData, setFormData] = useState({});
    const [tempInput, setTempInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [predictions, setPredictions] = useState({});
    const [currentPrediction, setCurrentPrediction] = useState('');
    const [error, setError] = useState('');

    const allQuestions = [
        // Personal Information
        { name: "Gender", label: "What is your gender?", type: "select", options: ["Male", "Female"] },
        { name: "AgeCategory", label: "Which age group do you belong to?", type: "select", 
          options: ["0-9", "10-19", "20-24", "25-59", "60 or older"] },
        { name: "Ethnicity", label: "What is your ethnicity?", type: "select",
          options: ["Caucasian", "African American", "Asian", "Other"] },
        
        // Health Basics
        { name: "GeneralHealth", label: "How would you rate your general health?", type: "select", 
          options: ["Excellent", "Very good", "Good", "Fair", "Poor"] },
        { name: "WeightInKilograms", label: "What is your weight in kilograms?", type: "number", min: 0, max: 300 },
        { name: "HeightInMeters", label: "What is your height in meters?", type: "number", min: 0, max: 3 },
        { name: "HeighInFeet", label: "What is your height in feet?", type: "number", min: 0, max: 10 }, 
        
        // Medical History
        { name: "HeartDisease", label: "Have you ever been diagnosed with heart disease?", type: "select", options: ["Yes", "No"] },
        { name: "Hypertension", label: "Do you have hypertension?", type: "select", options: ["Yes", "No"] },
        { name: "HadAngina", label: "Have you ever experienced angina?", type: "select", options: ["Yes", "No"] },
        { name: "HadCOPD", label: "Have you been diagnosed with COPD?", type: "select", options: ["Yes", "No"] },
        { name: "HadKidneyDisease", label: "Do you have any kidney disease?", type: "select", options: ["Yes", "No"] },
        
        // Lifestyle
        { name: "SmokerStatus", label: "What is your smoking status?", type: "select", 
          options: ["Never smoked", "Former smoker", "smokes"] },
        { name: "AlcoholConsumption", label: "Do you consume alcohol?", type: "select", options: ["Yes", "No"] },
        { name: "AlcoholDrinkers", label: "Are you a regular alcohol drinker?", type: "select", options: ["Yes", "No"] },
        { name: "PhysicalActivity", label: "How many hours per week do you engage in physical activity?", type: "number", min: 0, max: 168 },
        { name: "SleepHours", label: "How many hours do you sleep per night on average?", type: "number", min: 0, max: 24 },
        
        // Current Symptoms
        { name: "ChestPain", label: "Are you experiencing any chest pain?", type: "select", options: ["Yes", "No"] },
        { name: "Breathlessness", label: "Do you experience breathlessness?", type: "select", options: ["Yes", "No"] },
        { name: "Fatigue", label: "Do you often feel fatigued?", type: "select", options: ["Yes", "No"] },
        { name: "StressLevel", label: "How would you rate your stress level?", type: "select", options: ["Low", "Medium", "High"] },
        { name: "DifficultyConcentrating", label: "Do you have difficulty concentrating?", type: "select", options: ["Yes", "No"] },
        { name: "DifficultyWalking", label: "Do you have difficulty walking?", type: "select", options: ["Yes", "No"] },
        
        // Medical Tests
        { name: "blood_glucose_level", label: "What is your blood glucose level?", type: "number", min: 0, max: 1000 },
        { name: "HbA1c_level", label: "What is your HbA1c level?", type: "number", min: 0, max: 20 },
        { name: "ChestScan", label: "Have you had a chest scan recently?", type: "select", options: ["Yes", "No"] },
        { name: "CovidPos", label: "Have you ever tested positive for COVID-19?", type: "select", options: ["Yes", "No"] }
    ];

    const validateNumber = (value, min, max) => {
        const num = parseFloat(value);
        if (isNaN(num)) return "Please enter a valid number";
        if (num < min) return `Value must be at least ${min}`;
        if (num > max) return `Value must be less than ${max}`;
        return "";
    };

    const handleInputChange = (value, isSelect = false) => {
        setError('');
        const currentQuestion = allQuestions[currentQuestionIndex];
        
        if (isSelect) {
            // For select inputs, update and move to next question
            let updatedFormData = {
                ...formData,
                [currentQuestion.name]: value
            };

            setFormData(updatedFormData);
            if (currentQuestionIndex < allQuestions.length - 1) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
            }
        } else {
            // For number inputs, just update the temporary input
            setTempInput(value);
        }
    };

    const handleNumberSubmit = () => {
        const currentQuestion = allQuestions[currentQuestionIndex];
        const validationError = validateNumber(tempInput, currentQuestion.min, currentQuestion.max);
        
        if (validationError) {
            setError(validationError);
            return;
        }

        let updatedFormData = {
            ...formData,
            [currentQuestion.name]: parseFloat(tempInput)
        }; 

        // Calculate BMI if we have both height and weight
        if (currentQuestion.name === "WeightInKilograms" || 
            currentQuestion.name === "HeightInMeters" || 
            currentQuestion.name === "HeightInFeet") {
            
            const weight = updatedFormData.WeightInKilograms;
            const height = updatedFormData.HeightInMeters;
            
            if (weight && height) {
                updatedFormData.BMI = (weight / (height * height)).toFixed(2);
            }
        }

        setFormData(updatedFormData);
        setTempInput('');
        if (currentQuestionIndex < allQuestions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const predictDisease = async (disease) => {
        setCurrentPrediction(disease);
        const endpoint = {
            'Heart Disease': '/heartpredict',
            'Diabetes': '/diabetespredict',
            'Stroke': '/strokepredict',
            'Asthma': '/asthmapredict'
        }[disease];
        
        try {
            const response = await axios.post(
                `${API_BASE_URL}${endpoint}`, 
                formData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true
                }
            );
            setPredictions(prev => ({
                ...prev,
                [disease]: {
                    prediction: response.data.prediction === 1 ? "Positive" : "Negative",
                    probability: response.data.probability
                }
            }));
        } catch (error) {
            console.error(`Error predicting ${disease}:`, error);
            setPredictions(prev => ({
                ...prev,
                [disease]: {
                    error: true,
                    message: error.response?.data?.error || 'Prediction failed'
                }
            }));
        }
    };

    const handleSubmit = async () => {
        if (currentQuestion.type === 'number' && tempInput) {
            handleNumberSubmit();
        }
        setIsSubmitting(true);
        const diseases = ['Heart Disease', 'Diabetes', 'Stroke', 'Asthma'];
        
        for (const disease of diseases) {
            await predictDisease(disease);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        setIsSubmitting(false);
    };

    if (isSubmitting) {
        return (
            <div className="card w-full bg-base-100 shadow-xl h-screen">
                <div className="card-body items-center text-center">
                    <h2 className="card-title text-2xl mb-6">Analyzing Your Health Data</h2>
                    <div className="space-y-6">
                        {['Heart Disease', 'Diabetes', 'Stroke', 'Asthma'].map((disease) => (
                            <div key={disease} className="flex items-center space-x-4">
                                {currentPrediction === disease ? (
                                    <span className="loading loading-spinner loading-md"></span>
                                ) : predictions[disease] ? (
                                    <div className="badge badge-success">✓</div>
                                ) : (
                                    <div className="badge badge-ghost">•</div>
                                )}
                                <span className="text-lg">
                                    {disease} Analysis
                                    {predictions[disease] && (
                                        <span className="ml-2 text-success">Complete!</span>
                                    )}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (Object.keys(predictions).length > 0) {
        return (
            <div className="card w-full bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title text-2xl mb-6">Prediction Results</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        {Object.entries(predictions).map(([disease, result]) => (
                            <div key={disease} className={`alert ${result.prediction === "Positive" ? "alert-error" : "alert-success"}`}>
                                <div>
                                    <h3 className="font-bold">{disease}</h3>
                                    {result.error ? (
                                        <div className="text-error">
                                            {result.message}
                                        </div>
                                    ) : (
                                        <div className="text-sm">
                                            Result: {result.prediction}
                                            {result.probability && (
                                                <div>Probability: {(result.probability * 100).toFixed(1)}%</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <button 
                        onClick={() => {
                            setIsSubmitting(false);
                            setPredictions({});
                            setCurrentQuestionIndex(0);
                            setFormData({});
                            setTempInput('');
                            setError('');
                        }}
                        className="btn btn-primary mt-6 w-full"
                    >
                        Start New Prediction
                    </button>
                </div>
            </div>
        );
    }

    const currentQuestion = allQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / allQuestions.length) * 100;

    return (
        <div className="card w-full bg-base-100 shadow-xl ">
            <div className="card-body">
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                    <div 
                        className="bg-primary h-2.5 rounded-full transition-all duration-500" 
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                
                <p className="text-sm text-gray-500 mb-8">
                    Question {currentQuestionIndex + 1} of {allQuestions.length}
                </p>

                <h2 className="text-2xl font-bold mb-6">{currentQuestion.label}</h2>

                <div className="space-y-4">
                    {currentQuestion.type === 'select' ? (
                        <div className="grid gap-3">
                            {currentQuestion.options.map((option) => (
                                <button
                                    key={option}
                                    className={`btn btn-lg ${formData[currentQuestion.name] === option ? 'btn-primary' : 'btn-outline'}`}
                                    onClick={() => handleInputChange(option, true)}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <input
                                type="number"
                                className="input input-bordered w-full text-lg"
                                placeholder="Enter your answer"
                                value={tempInput}
                                onChange={(e) => handleInputChange(e.target.value)}
                                step="any"
                                min={currentQuestion.min}
                                max={currentQuestion.max}
                            />
                            {error && (
                                <p className="text-error text-sm">{error}</p>
                            )}
                            <button
                                onClick={handleNumberSubmit}
                                className="btn btn-primary w-full"
                                disabled={!tempInput}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex justify-between mt-8">
                    <button
                        onClick={() => {
                            setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1));
                            setTempInput('');
                            setError('');
                        }}
                        className="btn btn-outline"
                        disabled={currentQuestionIndex === 0}
                    >
                        Previous
                    </button>

                    {currentQuestionIndex === allQuestions.length - 1 && 
                     (currentQuestion.type === 'select' || formData[currentQuestion.name]) ? (
                        <button
                            onClick={handleSubmit}
                            className="btn btn-primary"
                        >
                            Get Prediction
                        </button>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default Predict;
