const {app,BrowserWindow,shell,dialog,session}=require('electron');
const path=require('node:path');
let mainWindow;
const start=()=>{
 mainWindow=new BrowserWindow({width:1520,height:1000,minWidth:860,minHeight:650,backgroundColor:'#f5f8f7',show:false,autoHideMenuBar:true,webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true}});
 mainWindow.loadFile(path.join(__dirname,'../web/index.html'));
 mainWindow.once('ready-to-show',()=>mainWindow.show());
 mainWindow.webContents.setWindowOpenHandler(({url})=>{
  if(/^https?:\/\//i.test(url))shell.openExternal(url);
  return {action:'deny'};
 });
 mainWindow.webContents.on('will-navigate',(e,url)=>{if(!url.startsWith('file://'))e.preventDefault()});
};
app.whenReady().then(()=>{
 session.defaultSession.on('will-download',async(e,item,webContents)=>{
  const suggested=item.getFilename().replace(/[\\/:*?"<>|]/g,'_');
  const result=await dialog.showSaveDialog(mainWindow,{title:'Salvar arquivo do FORMA Studio',defaultPath:path.join(app.getPath('documents'),suggested)});
  if(result.canceled){item.cancel();return;}
  item.setSavePath(result.filePath);
 });
 start();
 app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)start()});
});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});