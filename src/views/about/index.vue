<template>
  <div class="DonnieVault">
    <div class="header">
    
      <div class="donnieBankHeading">
        <div>DonnieBank</div>
        <div>Decentralized Total Financial Service Provider</div>
      </div>
    </div>

    <img :src="aboutImage" class="image"/>
    
  </div>
</template>

<script>
import aboutImage from '@/assets/donnie_about.png';
export default {
  mounted () {
  },    
  data() {
        return {
          aboutImage: aboutImage      
        }
    }
  
}
</script>

<style lang="less" scoped>
@import '@/styles/color.less';

.image {
  width: 100%;
  margin-top: 200px;
  padding-top: 100px;
  background: white;
}

.DonnieVault {
  flex: 1;
  padding-top: 70px;
  //background-color: @dark-blue;
  .header {
    display: flex;
    justify-content: center;
    margin-top: 40px;
    div {
      img:nth-child(1) {
        width: 60px;
      }
      // img:nth-child(2) {
      //   width: 270px;
      //   margin-left: 25px;
      // }
      .headline {
          margin-left: 10px;
          font-size: 60px;
          font-weight: 500;
          color: #eee;
      }
    }
  }
  .content {
    margin-top: 20px;
    color: #fff;
    p {
      width: 80%;
      max-width: 550px;
      text-align: center;
      font-weight: 400;
    }
    img {
      width: 80%;
      max-width: 593px;
      margin-top: 55px;
    }
  }
}
@media (max-width: 920px) {
  .image {
    margin-top: 80px;
  }

  .donnieBankHeading {
    margin: 0!important;
    text-align: center;
    
    & > div:first-child {
      color: @key;
      font-size: 30px;
      margin: 0!important;
    }
    & > div:last-child {
      color: @white;
      font-size: 20px;
      font-weight: 600;
      margin: 0!important;
    }
  }


  .DonnieVault {
    .header {
      display: flex;
      justify-content: center;
      margin-top: 0;
      div {
        margin-left: 20%;
        img:nth-child(1) {
          width: 15%;
        }
        img:nth-child(2) {
          width: 60%;
          margin-left: 5px;
        }
      }
    }
  }
}
</style>
