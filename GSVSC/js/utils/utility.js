export async function loadFile(url) {
  try {
    const response = await fetch(url);
    if (response.ok) {
      const text = await response.text();
      return text;
    } else {
      throw new Error('Network response was not ok.');
    }
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
}
export async function loadJSONFile(url) {
  try {
    const response = await fetch(url);
    if (response.ok) {
      const json = await response.json();
      return json;
    } else {
      throw new Error('Network response was not ok.');
    }
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
}