import styled, {css} from 'styled-components';
import FontFile from '~/styles/fonts'

const Fonts = css`
    @font-face {
        font-family: "NanumSquare";
        font-weight: 300;
        src: url(${FontFile.NanumSquareLeot});
        src: url(${FontFile.NanumSquareLeot}?#iefix) format('embedded-opentype'),
             url(${FontFile.NanumSquareLwoff}) format('woff'),
             url(${FontFile.NanumSquareLttf}) format('truetype');   
    }       
    @font-face {
        font-family: "NanumSquare";
        font-weight: 400;
        src: url(${FontFile.NanumSquareReot});
        src: url(${FontFile.NanumSquareReot}?#iefix) format('embedded-opentype'),
             url(${FontFile.NanumSquareRwoff2}) format('woff2'),
             url(${FontFile.NanumSquareRwoff}) format('woff'),
             url(${FontFile.NanumSquareRttf}) format('truetype');   
    }
    @font-face {
        font-family: "NanumSquare";
        font-weight: 700;
        src: url(${FontFile.NanumSquareBeot});
        src: url(${FontFile.NanumSquareBeot}?#iefix) format('embedded-opentype'),
             url(${FontFile.NanumSquareBwoff2}) format('woff2'),
             url(${FontFile.NanumSquareBwoff}) format('woff'),
             url(${FontFile.NanumSquareBttf}) format('truetype');   
    }
    @font-face {
        font-family: "NanumSquare";
        font-weight: 800;
        src: url(${FontFile.NanumSquareEBeot});
        src: url(${FontFile.NanumSquareEBeot}?#iefix) format('embedded-opentype'),
             url(${FontFile.NanumSquareEBwoff2}) format('woff2'),
             url(${FontFile.NanumSquareEBwoff}) format('woff'),
             url(${FontFile.NanumSquareEBttf}) format('truetype');   
    }    

    @font-face {
        font-family: "SeoulHangangM";
        src: url(${FontFile.SeoulHangangMWoff}) format('woff');
        font-weight: normal;
        font-stretch: normal;
        font-style: normal;
        letter-spacing: normal;
    }
    @font-face {
        font-family: "SeoulHangangL";
        src: url(${FontFile.SeoulHangangLWoff}) format('woff');
        font-weight: normal;
        font-stretch: normal;
        font-style: normal;
        letter-spacing: normal;
    }
    @font-face {
        font-family: "SeoulHangangB";
        src: url(${FontFile.SeoulHangangBWoff}) format('woff');
    }
    @font-face {
        font-family: "SeoulHangangEB";
        src: url(${FontFile.SeoulHangangEBWoff}) format('woff');
    }
    @font-face {
        font-family: 'NotoSansKR';
        font-style: normal;
        font-weight: 100;
        src: url(${FontFile.NotoSansKRThinWoff2}) format('woff2'),
             url(${FontFile.NotoSansKRThinWoff}) format('woff'),
             url(${FontFile.NotoSansKRThinOtf}) format('opentype');
    }
    @font-face {
        font-family: 'NotoSansKR';
        font-style: normal;
        font-weight: 300;
        src: url(${FontFile.NotoSansKRLightWoff2}) format('woff2'),
             url(${FontFile.NotoSansKRLightWoff}) format('woff'),
             url(${FontFile.NotoSansKRLightOtf}) format('opentype');
    }
    @font-face {
        font-family: 'NotoSansKR';
        font-style: normal;
        font-weight: normal;
        src: url(${FontFile.NotoSansKRRegularWoff2}) format('woff2'),
             url(${FontFile.NotoSansKRRegularWoff}) format('woff'),
             url(${FontFile.NotoSansKRRegularOtf}) format('opentype');
    }
    @font-face {
        font-family: 'NotoSansKR';
        font-style: normal;
        font-weight: 500;
        src: url(${FontFile.NotoSansKRMediumWoff2}) format('woff2'),
             url(${FontFile.NotoSansKRMediumWoff}) format('woff'),
             url(${FontFile.NotoSansKRMediumOtf}) format('opentype');
    }
    @font-face {
        font-family: 'NotoSansKR';
        font-style: normal;
        font-weight: bold;
        src: url(${FontFile.NotoSansKRBoldWoff2}) format('woff2'),
             url(${FontFile.NotoSansKRBoldWoff}) format('woff'),
             url(${FontFile.NotoSansKRBoldOtf}) format('opentype');
    }
`;
const Reset = css`
    html, body, div, span, applet, object, iframe,
    h1, h2, h3, h4, h5, h6, p, blockquote, pre,
    a, abbr, acronym, address, big, cite, code,
    del, dfn, em, img, ins, kbd, q, s, samp,
    small, strike, strong, sub, sup, tt, var,
    b, u, i, center,
    dl, dt, dd, ol, ul, li,
    fieldset, form, label, legend,
    table, caption, tbody, tfoot, thead, tr, th, td,
    article, aside, canvas, details, embed,
    figure, figcaption, footer, header, hgroup,
    main, menu, nav, output, ruby, section, summary,
    time, mark, audio, video {
      margin: 0;
      padding: 0;
      border: 0;
      //font-size: 100%;
      //font: inherit;
      vertical-align: baseline;
      box-sizing: border-box;
    }
    /* HTML5 display-role reset for older browsers */
    article, aside, details, figcaption, figure,
    footer, header, hgroup, main, menu, nav, section {
      display: block;
    }
    /* HTML5 hidden-attribute fix for newer browsers */
    *[hidden] {
        display: none;
    }
    body {
      line-height: 1.5;
      // font-family: 'NanumSquare', sans-serif;
      font-family: 'Noto Sans', sans-serif;
      
      & input[type=password] {
            font-family: "NotoSansKR";
        }
      height: 100%;
    }
    #root {
        height: 100%;
    }
    ol, ul {
      list-style: none;
    }
    // blockquote, q {
    //   quotes: none;
    // }
    // blockquote:before, blockquote:after,
    // q:before, q:after {
    //   content: '';
    //   content: none;
    // }
    table {
      border-collapse: collapse;
      border-spacing: 0;
    }
    
    //구글 input 자동완성 색상제거
    input:-webkit-autofill,
    input:-webkit-autofill:hover,
    input:-webkit-autofill:focus,
    input:-webkit-autofill:active {
	 transition: background-color 5000s ease-in-out 0s;
	 -webkit-transition: background-color 9999s ease-out;
     -webkit-box-shadow: 0 0 0 1000px white inset;
   }
   
   /* 브라우저에서 프린트 출력 할 경우 size: auto 로 지정 해야 가로/세로 모드를 사용자가 설정 가능함 */
    @page  {
        size: auto;
    }
    /* 프린트 영역은 기본 숨김처리, window.print() 시 아래의 @media print 를 타게 됨 */
    @media screen {
        .printable {
            display: none;
        }
    }
   
   @media print
    {
        body * {
            visibility: hidden;
        }
    
        /* 프린트 영역 이외 모두 숨김처리 */
        .none-printable {
            display: none;
        }
    
        .printable *{
            visibility: visible;
        }
    
        .printable {
            width: 100%;
            position: absolute;
            left: 0;
            top: 0;
        }
    
        /* 페이지 나누기[프린트가 62mm 에맞게 자동으로 자르니 필요없음 */
        /*.page-break  { display:block; page-break-before:always;}*/
    }
    
    /* 스크롤바 */
    ::-webkit-scrollbar {
      width: 8px;
    }
    /* Track */
    ::-webkit-scrollbar-track {
      background: #f1f1f1; 
    }
    
    /* Handle */
    ::-webkit-scrollbar-thumb {
      background: #888; 
    }
    
    /* Handle on hover */
    ::-webkit-scrollbar-thumb:hover {
      background: #555; 
    }
`;
export default {Fonts,Reset};