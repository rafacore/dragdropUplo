import React from 'react';
import './drop.css';
import Dropzone from 'react-dropzone'
import request from "superagent";
import { Line } from 'rc-progress';     

const imageMaxSize= 1000000000;
const acceptedFileTypes = 'image/x-png, image/png, image/jpg, image/jpeg, image/gif'
const acceptedFileTypesArray = acceptedFileTypes.split(",").map((item) => {return item.trim()})
class Drop extends React.Component{
   
    constructor(props){
        super(props)
        this.imagePreviewCanvasRef = React.createRef()
        this.fileInputRef = React.createRef()
        this.state = {
            imgSrc: null,
            imgSrcExt: null,
            completed: 0
        }
    }
   
   
    verifyFile = (files) => {
        if (files && files.length > 0){
            const currentFile = files[0]
            const currentFileType = currentFile.type
            const currentFileSize = currentFile.size
            if(currentFileSize > imageMaxSize) {
                alert("This file is not allowed. " + currentFileSize + " bytes is too large")
                return false
            }
            if (!acceptedFileTypesArray.includes(currentFileType)){
                alert("This file is not allowed. Only images are allowed.")
                return false
            }
            return true
        }
    }



         removeFile(file) {
        this.setState(state => {
          const index = state.files.indexOf(file);
          const files = state.files.slice(0);
          files.splice(index, 1);
          return {files}; 
        });
      }
      

    handleOnDrop = (files, rejectedFiles) => {
        this.setState({ completed: 0 });
        var data = new FormData();
        if (rejectedFiles && rejectedFiles.length > 0){
            this.verifyFile(rejectedFiles)
        }


        if (files && files.length > 0){
             const isVerified = this.verifyFile(files)
             if (isVerified){            
                 const currentFile = files[0]
                 const myFileItemReader = new FileReader()
                 myFileItemReader.addEventListener("load", ()=>{
                     const myResult = myFileItemReader.result 
                     this.setState({
                         imgSrc: myResult,
                         
                        
                     })
                 }, false) 

                 myFileItemReader.readAsDataURL(currentFile) 

             }
        }
        var req = request.post("http://localhost:3001");
        req.on('progress', event => {
          var percent = Math.floor(event.percent);
          if (percent >= 100) {
            this.setState({ completed: 100 });
           console.log('state.completed is now 100');
          } else {
            this.setState({ completed: percent });
          }
        });

        
    
        const that = this;
        req.send(data);
        req.end((err, res) => {
          console.log("Successfully uploaded");
        });
    }

    
    

    render() { 
        const {imgSrc} = this.state      
        return (
       <div>
              <Dropzone onDrop={this.handleOnDrop} multiple={true} accept='image/*' maxSize={imageMaxSize} onFileDialogCancel={this.onCancel} >
                {({getRootProps, getInputProps}) => 
                 (<div>
                     <div className="dragdrop" {...getRootProps()} >
                        <input  {...getInputProps()} />
                        <p>Drag and Drop your files or Browse</p>
                        {imgSrc !== null ?
                         <div  className="predi"  >
                        <img className="preimg" src={imgSrc} />
                        <a href="" onClick="removeFile(this)">click para deletar a imagem </a>
                        </div>:''}
                    </div >
            <Line percent={this.state.completed} strokeWidth="0.5" strokeColor="#2db7f5" strokeLinecap="square" >{this.state.completed}</Line>
           
                </div>
                )}
            </Dropzone>
        </div>
          )
    }
}
export default Drop