import React from 'react';
import Header from "~/components/common/header";
import Footer from '~/components/common/footer'
import styled from 'styled-components'
import DonnieBackground from '~/assets/Donnie_background.png'
import {Div} from "~/styledComponents/shared";
import useSize from "~/hooks/useSize";
import MyDon from "~/components/common/layouts/MyDon";
import ComUtil from "~/util/ComUtil";

const webHeight = 70
const mHeight = 54

const BackgroundContainer = styled(Div)`
    background: url(${DonnieBackground}) no-repeat;
    background-position: top;
    min-height: 800px;
`;

export default ({children}) => {

    const {sizeValue} = useSize()

    const height = sizeValue(webHeight, mHeight, mHeight)

    return (
        <BackgroundContainer>
            <Header height={height}/>
            {/*
                - 라우터가 바뀔때 로드 되는동안 content 가 없어 footer가 올라오는 현상을 없애기 위해 강제로 minHeight 적용
                *(없애고 각각의 컨텐츠 페이지 내에 minHeight를 줘도 무방[페이지가 다이내믹하다면..])
            */}
            <Div
                relative
                pt={height}
                 minHeight={sizeValue(900, null, 600)}
            >
                {
                    !ComUtil.isMobile() && <MyDon/>
                }
                {
                    children
                }
            </Div>
            <Footer />
        </BackgroundContainer>
    );
};

