import React, { Fragment, useState, useEffect } from 'react'
import {Div, Span, Button} from '~/styledComponents/shared'
import properties from "~/properties";
import axios from 'axios'
import fileApi from "~/lib/fileApi";
import Compressor from 'compressorjs'
import styled from "styled-components";
const StyledItem = styled.div`
    flex-shrink: 0;
    display: flex;
    background-color: #8a8a8a;
    color: white;
    align-items: center;
    justify-content: center;
    height: 9em;
    width: 9em;
    position: relative;
    border-radius: 5px;
    font-weight: 400;
`;
const StyledImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 5px;
`
const KycSingleImageUploader = (props) => {

    const {account, idoId} = props;
    const [image,setImage] = useState({});
    const [loading,setLoading] = useState(false);
    const [file,setFile] = useState({});


    const onImageUploadClick = () => {
        file.click()
    }

    const checkFileSize = (file) => {
        const maxFileSizeMB = 10;
        const limitedSize = maxFileSizeMB * 1024;
        const fileSize = file.size / 1024;

        if(fileSize > limitedSize){
            return false
        }
        return true
    }


    const onFileClick = (e) => {
        e.stopPropagation()
    }

    const onImageChange = async (e) => {

        let file = e.target.files[0];

        // 이미지 압축 및 서버 업로드(0.6은 대략 60% 정도의 용량이 줄어듬, 추천하는 압축률)
        new Compressor(file, {
            quality: 0.6,
            success: async (result) => {

                // 파일 사이즈 체크(압축된 파일로)
                if(!checkFileSize(result))
                {
                    window.$message.warn(`Image Big Size!!`)
                    file.value = '';
                    return false
                }

                const formData = new FormData();
                // The third parameter is required for server
                formData.append('file', result, result.name);
                formData.append('account', account);
                formData.append('idoId', idoId);

                //서버에 파일 업로드
                const { status, data: kycImage } = await upload(formData);

                if(status !== 200){
                    window.$message.warn(`Upload Error!!)`)
                    file.value = '';
                    return
                }
                console.log("kycImage",kycImage);

                const tmpImage = {
                    imageUrlPath: kycImage.fileUrlPath,
                    imageUrl: kycImage.fileName,
                    imageNm: file.name
                };

                //console.log("tmpImage",tmpImage);
                setImage(tmpImage);
                props.onChange(tmpImage)
            },
            error(err) {
                console.log(err.message);
            },
        });
    }

    const upload = async (formData) => {
        return await fileApi.kycImgFile(formData);
    };

    return(
        <StyledItem onClick={onImageUploadClick}>
            {
                image.imageUrl ? (
                        <Fragment>
                            <StyledImg src={image.imageUrl ? properties.DOMAIN + image.imageUrlPath + image.imageUrl : ''} />
                        </Fragment>

                    ) : props.kycTitle ? '+ '+props.kycTitle:'+ KYC Photo Image'
            }
            <input
                style={{display:'none'}}
                type='file'
                ref={refFile => setFile(refFile)}
                onClick={onFileClick}
                onChange={onImageChange}
                accept='image/jpeg, image/png'
            />
        </StyledItem>
    )
}
export default KycSingleImageUploader