from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pickle
import os


MODEL_PATH = os.path.join('C:/Users/vishe/OneDrive/Desktop/4thsem/disease-prediction-app/backend/app/pickle_files', 'heart_model_pickle.pkl')


with open(MODEL_PATH, 'rb') as file:
    model = pickle.load(file)


app = Flask(__name__)
CORS(app)


COLUMNS = [
    'WeightInKilograms', 'BMI', 'HadAngina', 'HadCOPD', 'HadKidneyDisease',
    'DifficultyConcentrating', 'DifficultyWalking', 'ChestScan',
    'AlcoholDrinkers', 'CovidPos', 'HeighInFeet', 'GeneralHealth_Excellent',
    'GeneralHealth_Fair', 'GeneralHealth_Good', 'GeneralHealth_Poor',
    'GeneralHealth_Very good', 'Sex_Female', 'Sex_Male',
    'SmokerStatus_Former smoker', 'SmokerStatus_Never smoked',
    'SmokerStatus_smokes', 'AgeCategory_0-9', 'AgeCategory_10-19',
    'AgeCategory_20-24', 'AgeCategory_25-59', 'AgeCategory_60 or older'
]


SCALES = {
    'WeightInKilograms': (30, 200),  
    'BMI': (10, 50),                 
    'HeighInFeet': (4, 7)            
}


GENERAL_HEALTH = ['Excellent', 'Fair', 'Good', 'Poor', 'Very good']
SEX = ['Female', 'Male']
SMOKER_STATUS = ['Former smoker', 'Never smoked', 'smokes']
AGE_CATEGORY = ['0-9', '10-19', '20-24', '25-59', '60 or older']


def scale_value(value, min_val, max_val):
    return (value - min_val) / (max_val - min_val)
@app.route("/predictStroke", methods=["POST"])
def predict():
    # Get input data from frontend (user data)
    user_data = request.get_json()

    # Print incoming data for debugging (optional)
    print("Received data:", user_data)

    # Process the input data and convert categorical features to numeric if needed
    features1 = [
    [
        user_data["age"],  # Age
        1 if user_data["gender"].lower() == "male" else 0,  # Gender (Male = 1, Female = 0)
        1 if user_data["hypertension"].lower() == "yes" else 0,  # Hypertension (Yes = 1, No = 0)
        1 if user_data["heart_disease"].lower() == "yes" else 0,  # Heart Disease (Yes = 1, No = 0)
        1 if user_data["ever_married"].lower() == "yes" else 0,  # Ever Married (Yes = 1, No = 0)
        ["govt_job", "never_worked", "private", "self-employed", "children"].index(user_data["work_type"].lower()),  # Work Type (index value)
        1 if user_data["residence_type"].lower() == "urban" else 0,  # Residence Type (Urban = 1, Rural = 0)
        user_data["avg_glucose_level"],  # Average Glucose Level
        user_data["bmi"],  # BMI
        ["formerly smoked", "never smoked", "smokes", "unknown"].index(user_data["smoking_status"].lower()),  # Smoking Status (index value)
    ]
]
    features = [[0,4,0,0,0,0,1,82.10,27.1,0]]
    
    # Predict using the loaded model
    prediction = stroke_model.predict(features)  # Model's .predict() method

    # Convert the prediction result to a more user-friendly output (optional)
    prediction_label = "Stroke" if prediction[0] == 1 else "No Stroke"

    # Return the prediction as JSON
    print(prediction_label, prediction[0])
    return jsonify({"prediction": prediction_label, "probability": float(prediction[0])})
def predict_disease(data):
    try:
       
        features = []

       
        for col in ['WeightInKilograms', 'BMI', 'HeighInFeet']:
            min_val, max_val = SCALES[col]
            scaled_value = scale_value(data[col], min_val, max_val)
            features.append(scaled_value)

        
        for col in ['HadAngina', 'HadCOPD', 'HadKidneyDisease',
                    'DifficultyConcentrating', 'DifficultyWalking', 'ChestScan',
                    'AlcoholDrinkers', 'CovidPos']:
            features.append(data[col])

        
        general_health_onehot = [1 if data['GeneralHealth'] == category else 0 for category in GENERAL_HEALTH]
        features.extend(general_health_onehot)

       
        sex_onehot = [1 if data['Sex'] == category else 0 for category in SEX]
        features.extend(sex_onehot)

        
        smoker_status_onehot = [1 if data['SmokerStatus'] == category else 0 for category in SMOKER_STATUS]
        features.extend(smoker_status_onehot)

        
        age_category_onehot = [1 if data['AgeCategory'] == category else 0 for category in AGE_CATEGORY]
        features.extend(age_category_onehot)

       
        if len(features) != len(COLUMNS):
            return {'error': f'Input data shape mismatch. Expected {len(COLUMNS)} features, got {len(features)}'}

        
        features = np.array(features).reshape(1, -1)

        
        probability = model.predict(features)[0]  

       
        return {
            'prediction': int(probability > 0.5),  
            'probability': float(probability)  
        }

    except Exception as e:
        return {'error': str(e)}

@app.route('/')
def home():
    return "Welcome to the Disease Prediction API!"

@app.route('/heartpredict', methods=['POST'])
def predict():
    try:
      
        data = request.get_json()

        
        result = predict_disease(data)

        if 'error' in result:
            return jsonify(result), 400

        return jsonify(result)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
