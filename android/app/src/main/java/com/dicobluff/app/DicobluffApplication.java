package com.dicobluff.app;

import android.app.Application;
import android.os.Handler;
import android.os.Looper;
import com.facebook.FacebookSdk;
import com.facebook.appevents.AppEventsLogger;

public class DicobluffApplication extends Application {
    // FacebookSdk.fullyInitialize()/AppEventsLogger.activateApp() appellent graph.facebook.com
    // dès le démarrage. Sur réseau lent, ça retardait l'affichage de la 1ère frame de 20-40s
    // (mesuré) et pouvait faire dépasser le timeout de connexion Firebase côté WebView.
    // On les reporte après le démarrage critique pour ne plus concurrencer le chargement de la WebView.
    private static final long FACEBOOK_SDK_INIT_DELAY_MS = 5000;

    @Override
    public void onCreate() {
        super.onCreate();
        new Handler(Looper.getMainLooper()).postDelayed(() -> {
            FacebookSdk.fullyInitialize();
            AppEventsLogger.activateApp(this);
        }, FACEBOOK_SDK_INIT_DELAY_MS);
    }
}
