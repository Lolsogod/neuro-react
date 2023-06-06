import { useRef, useState } from 'react'
import './App.css'
import * as tf from '@tensorflow/tfjs';

function App() {
  const [imageUrl, setImageUrl] = useState('');
  const imageElement = useRef<HTMLImageElement>(null);
  const [result,setResult] = useState<string>('');
  const [confidence, setConfidence] = useState<string>();

  const labels = ['Мяч для американского футбола', 'Бейсбольный мяч', 'Баскетбольный мяч', 'Бильярдный шар',
  'Шар для боулинга', 'Мяч для крикета', 'Футбольный мяч', 'Мяч для гольфа', 'Хоккейная шайба',
  'Мяч для регби', 'Воланчик', 'Мяч для настольного тенниса', 'Теннисный  мяч', 'Волейбольный мяч']

  function handleFileUpload(event:any) {
    setResult("")
    setConfidence("")
    setImageUrl("")
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e: any) => {
      setImageUrl(e.target.result);
    };
    reader.readAsDataURL(file);
    start()
  }

  const loadModel = async () => {
    return tf.loadGraphModel("/src/assets/Balls_model_js/model.json")
  }

  const preprocess = () => {
    const imgTensor = tf.browser.fromPixels(imageElement.current);
    //@ts-ignore
    const imgResized = tf.image.resizeBilinear(imgTensor, [224, 224]).div(tf.scalar(255.0))
    const imgExpanded = imgResized.expandDims();
    return imgExpanded
  }

  function extractData(prediction: string) {
    const startIndex = prediction.indexOf('[');
    const cleanStr = prediction.slice(startIndex).replace(/\[|\]|,/g, '');
    const substrings = cleanStr.split(' ');
    const floats = substrings.map(substring => parseFloat(substring));
  
    return floats;
  }

  function toPercent(probability: number) {
    const percent = (probability * 100).toFixed(2);
    return ` - ${percent}%`
  }


  const start = async () => {
    const model = await loadModel()
    let prediction = await model.predict(preprocess());
    let predArray =  extractData(prediction.toString())
    const conf= Math.max(...predArray)
    setConfidence(toPercent(conf))
    const predicted = predArray.indexOf(conf);
    setResult(labels[predicted])
  }

  return (
    <>
      <h1>{result}{confidence}</h1>
      <img ref={imageElement} src={imageUrl} height="500" id="img"/>
      <br />
      <label htmlFor="upload" className="custom-file-upload">
          Загрузить изображение
      </label>
      <br />
      <input id="upload" type="file" onChange={handleFileUpload} accept="image/*" />
    </>
  )
}

export default App
