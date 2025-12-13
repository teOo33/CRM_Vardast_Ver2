import { VARDAST_API_KEY, VARDAST_BASE_URL, VARDAST_CHANNEL_ID } from '../constants';

let cachedContactId = null;

export const getDashboardContactId = () => {
  let savedId = localStorage.getItem('vardast_dashboard_contact_id');
  if (!savedId) {
    savedId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    localStorage.setItem('vardast_dashboard_contact_id', savedId);
  }
  return savedId;
};

export const callVardastAI = async (prompt, isJson = false) => {
  if (!VARDAST_API_KEY) return alert('کلید API وردست وارد نشده است.');
  
  try {
    if (!cachedContactId) {
      cachedContactId = getDashboardContactId();
    }

    const response = await fetch(`${VARDAST_BASE_URL}/messenger/api/chat/public/process`, {
      method: 'POST',
      headers: { 
        'X-API-Key': VARDAST_API_KEY, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        message: prompt,
        channel_id: VARDAST_CHANNEL_ID,
        contact_id: cachedContactId
      }),
    });

    if (response.status === 422) {
       console.error("Vardast 422 Error.");
       return "خطای ۴۲۲: داده نامعتبر.";
    }

    const data = await response.json();

    if (data.status === 'success' && data.response) {
      let resultText = data.response;
      if (isJson) {
        resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
      }
      return resultText;
    } else {
      console.error('Vardast Error:', data);
      return `خطا: ${data.error || 'Unknown error'}`;
    }

  } catch (error) {
    console.error('Vardast Connection Error:', error);
    return "خطای ارتباط با سرور.";
  }
};
