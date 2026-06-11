#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(SharedPrefs, NSObject)

RCT_EXTERN_METHOD(setAppGroupString:(NSString *)key value:(NSString *)value)
RCT_EXTERN_METHOD(setKeyboardData:(NSString *)encoded)
RCT_EXTERN_METHOD(setKeyboardTheme:(NSString *)theme)
RCT_EXTERN_METHOD(clearAppGroup)

@end
