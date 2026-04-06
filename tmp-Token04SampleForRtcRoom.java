package im.zego.serverassistant.sample;

import im.zego.serverassistant.utils.TokenServerAssistant;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.Base64;

//
// Example of generating an authorization token. Contact ZEGO technical support to enable this feature.
//

public class Token04SampleForRtcRoom {
    public static void main(String[] args) {
        long appId = 1222222222L;    // Replace with your own appId, obtained from the ZEGO console
        String serverSecret = "12345678900987654321123456789012";  // Replace with your own serverSecret, obtained from the ZEGO console
        String userId = "test_user";    // Replace with the userID of the user, unique across the entire network under the same appId
        int effectiveTimeInSeconds = 300;   // Effective time, in seconds

        // Create the payloadData object
        JSONObject payloadData = new JSONObject();
        payloadData.put("room_id", "demo"); // Room ID, restricts users to logging in to specific rooms, required.
        JSONObject privilege = new JSONObject();
        //Login room permission TokenServerAssistant.PrivilegeEnable means allowed, TokenServerAssistant.PrivilegeDisable means not allowed
        //This means that logging in to the room is allowed
        privilege.put(TokenServerAssistant.PrivilegeKeyLogin, TokenServerAssistant.PrivilegeEnable);

        //Whether to allow streaming TokenServerAssistant.PrivilegeEnable means allowed, TokenServerAssistant.PrivilegeDisable means not allowed
        //This means that streaming is not allowed
        privilege.put(TokenServerAssistant.PrivilegeKeyPublish, TokenServerAssistant.PrivilegeDisable);
        payloadData.put("privilege", privilege); // Required, one or both of the login room and streaming permissions must be assigned.
        payloadData.put("stream_id_list", null); // Stream list, optional
        String payload = payloadData.toJSONString();

        TokenServerAssistant.VERBOSE = false;    // When debugging, set to true to output more information to the console; when running formally, it is best to set to false
        TokenServerAssistant.TokenInfo token = TokenServerAssistant.generateToken04(appId,  userId, serverSecret, effectiveTimeInSeconds, payload);
        System.out.println(token.data);

        if (token.error == null || token.error.code == TokenServerAssistant.ErrorCode.SUCCESS) {
            System.out.println("\r\ndecrypt the token ...");
            decryptToken(token.data, serverSecret);
        }
    }

    static private void decryptToken(String token, String secretKey) {
        String noVersionToken = token.substring(2);

        byte[] tokenBytes = Base64.getDecoder().decode(noVersionToken.getBytes());
        ByteBuffer buffer = ByteBuffer.wrap(tokenBytes);
        buffer.order(ByteOrder.BIG_ENDIAN);
        long expiredTime = buffer.getLong();
        System.out.println("expiredTime: " + expiredTime);
        int IVLength = buffer.getShort();
        byte[] ivBytes = new byte[IVLength];
        buffer.get(ivBytes);
        int contentLength = buffer.getShort();
        byte[] contentBytes = new byte[contentLength];
        buffer.get(contentBytes);

        try {
            SecretKeySpec key = new SecretKeySpec(secretKey.getBytes(), "AES");
            IvParameterSpec iv = new IvParameterSpec(ivBytes);

            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
            cipher.init(Cipher.DECRYPT_MODE, key, iv);

            byte[] rawBytes = cipher.doFinal(contentBytes);
            JSONParser parser = new JSONParser();
            JSONObject json = (JSONObject)parser.parse(new String(rawBytes));
            System.out.println(json);
        } catch (Exception e) {
            System.out.println("decrypt failed: " + e);
        }
    }
}
