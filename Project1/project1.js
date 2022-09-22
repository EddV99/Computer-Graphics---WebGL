// bgImg is the background image to be modified.
// fgImg is the foreground image.
// fgOpac is the opacity of the foreground image.
// fgPos is the position of the foreground image in pixels. It can be negative and (0,0) means the top-left pixels of the foreground and background are aligned.
function composite( bgImg, fgImg, fgOpac, fgPos )
{
 //alpha blending c = α_fg*c_fg + (1 - α_fg)c_bg
 //
 //better 
 // α = α_fg + (1 - α_fg)α_bg
 // 
 // c = (α_fg*c_fg + (1 - α_fg)α_bg*c_bg) / α
 //
 // if α = 0 then c = c_bg

 //pos * 4 is array position of red channel
 // i : r || i + 1 : g || i + 2 : b || i + 3 : alpha
for(let x = 0; x <= fgImg.width; x++){
    for(let y = 0; y <= fgImg.height; y++){
        let i_x = x + fgPos.x;
        let i_y = y + fgPos.y;
        if((i_x >= 0 && i_x < bgImg.width) && (i_y >= 0 && i_y < bgImg.height)){
        i_fg = convert(x, y, fgImg.width);
        i_bg = convert(i_x, i_y, bgImg.width);
        alpha_fg = fgImg.data[i_fg + 3] * fgOpac;
        alpha = alpha_fg + (1 - alpha_fg)*bgImg.data[i_bg + 3];
        if(alpha != 0){
        calculateBGColor(0); //r
        calculateBGColor(1); //g
        calculateBGColor(2); //b
        } else{
            bgImg.data[i_bg] = bgImg.data[i_bg];
            bgImg.data[i_bg + 1] = bgImg.data[i_bg + 1];
            bgImg.data[i_bg + 2] = bgImg.data[i_bg + 2];
        }
        }
    }
}
 function calculateBGColor(offset){
    bgImg.data[i_bg + offset] = (alpha_fg*fgImg.data[i_fg + offset] + (1 - alpha_fg)*bgImg.data[i_bg + 3]*bgImg.data[i_bg + offset]) / alpha;
 }
 function convert(x, y, width){
    return 4*(width * x + y)
 }
  
}
