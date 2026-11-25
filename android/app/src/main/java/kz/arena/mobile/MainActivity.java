package kz.arena.mobile;
import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.Build;
import android.view.View;
import android.view.WindowInsets;
import android.graphics.Insets;
import android.widget.FrameLayout;
import android.webkit.*;
import androidx.webkit.WebViewAssetLoader;
public class MainActivity extends Activity {
 private WebView web;
 private FrameLayout root;
 private View fullscreen;
 private WebChromeClient.CustomViewCallback fullCallback;
 private static final String HOST="appassets.androidplatform.net";
 @Override public void onCreate(Bundle saved){
  super.onCreate(saved);web=new WebView(this);root=new FrameLayout(this);root.addView(web,new FrameLayout.LayoutParams(-1,-1));
  root.setOnApplyWindowInsetsListener((view,insets)->{if(Build.VERSION.SDK_INT>=30){Insets bars=insets.getInsets(WindowInsets.Type.systemBars()|WindowInsets.Type.displayCutout());view.setPadding(bars.left,bars.top,bars.right,bars.bottom);}else view.setPadding(insets.getSystemWindowInsetLeft(),insets.getSystemWindowInsetTop(),insets.getSystemWindowInsetRight(),insets.getSystemWindowInsetBottom());return insets;});
  WebSettings settings=web.getSettings();settings.setJavaScriptEnabled(true);settings.setDomStorageEnabled(true);settings.setAllowFileAccess(false);settings.setAllowContentAccess(false);settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);settings.setMediaPlaybackRequiresUserGesture(true);CookieManager.getInstance().setAcceptThirdPartyCookies(web,false);
  final WebViewAssetLoader loader=new WebViewAssetLoader.Builder().addPathHandler("/assets/",new WebViewAssetLoader.AssetsPathHandler(this)).build();
  web.setWebViewClient(new WebViewClient(){
   @Override public WebResourceResponse shouldInterceptRequest(WebView view,WebResourceRequest request){return loader.shouldInterceptRequest(request.getUrl());}
   @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest request){Uri uri=request.getUrl();if("https".equals(uri.getScheme())&&HOST.equals(uri.getHost()))return false;if(request.isForMainFrame()&&("https".equals(uri.getScheme())||"mailto".equals(uri.getScheme()))){try{startActivity(new Intent(Intent.ACTION_VIEW,uri));}catch(Exception ignored){}}return true;}
  });
  web.setWebChromeClient(new WebChromeClient(){@Override public void onShowCustomView(View view,CustomViewCallback callback){if(fullscreen!=null){callback.onCustomViewHidden();return;}fullscreen=view;fullCallback=callback;setContentView(view);}@Override public void onHideCustomView(){exitFullscreen();}});
  setContentView(root);if(saved==null||web.restoreState(saved)==null)web.loadUrl("https://"+HOST+"/assets/www/index.html");
 }
 private void exitFullscreen(){if(fullscreen==null)return;fullscreen=null;setContentView(root);if(fullCallback!=null){fullCallback.onCustomViewHidden();fullCallback=null;}}
 @Override public void onBackPressed(){if(fullscreen!=null){exitFullscreen();return;}web.evaluateJavascript("(function(){var d=document.querySelector('#mobileDialog');var h=document.querySelector('#gameHost');return !!((d&&d.open)||(h&&!h.hidden)||location.pathname.indexOf('/subjects/')>=0)})()",value->{if("true".equals(value))web.evaluateJavascript("window.dispatchEvent(new Event('arena-native-back'))",null);else if(web.canGoBack())web.goBack();else finish();});}
 @Override protected void onSaveInstanceState(Bundle out){web.saveState(out);super.onSaveInstanceState(out);}
 @Override protected void onPause(){web.onPause();super.onPause();}
 @Override protected void onResume(){super.onResume();if(web!=null)web.onResume();}
 @Override protected void onDestroy(){if(web!=null)web.destroy();super.onDestroy();}
}
