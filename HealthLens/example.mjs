import OpenAI from 'openai';
import 'dotenv/config'; 

const openai = new OpenAI(); 

async function testDiagnosisJSON() {

  const cnnDiagnosis = "Mild Atopic Dermatitis (Eczema)"; 
  console.log(`Sending CNN Diagnosis to OpenAI: "${cnnDiagnosis}"...\n`);
  
  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini", 
      response_format: { type: "json_object" },
      messages: [
        { 
          role: "system", 
          content: "You are a dermatology assistant. You will receive a skin diagnosis from a CNN model. You must respond in valid JSON format with exactly three keys: 'diagnosis', 'simple_explanation', and 'recommended_action'." 
        },
        { 
          role: "user", 
          content: `The CNN model diagnosed this skin image as: ${cnnDiagnosis}. Please provide details.` 
        },
      ],
    });

    // 3. Grab the raw JSON string OpenAI returns
    const jsonString = chatCompletion.choices[0].message.content;
    
    // 4. Convert that string into a real JavaScript Object
    const jsonObject = JSON.parse(jsonString);

    console.log("JSON Object Received Successfully:\n");
    console.log(jsonObject);

  } catch (error) {
    console.error("\n Error:", error.message);
  }
}

testDiagnosisJSON();