package com.mediconnect.consultation.util;

import com.fasterxml.jackson.databind.ObjectMapper;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Random;

public final class ZegoTokenGenerator {

    public static final String PRIVILEGE_LOGIN = "1";
    public static final String PRIVILEGE_PUBLISH = "2";
    public static final int PRIVILEGE_ENABLED = 1;
    public static final int PRIVILEGE_DISABLED = 0;

    private static final String VERSION_FLAG = "04";
    private static final String TRANSFORMATION = "AES/CBC/PKCS5Padding";
    private static final int IV_LENGTH = 16;
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private ZegoTokenGenerator() {
    }

    public static String generateToken(
            long appId,
            String userId,
            String serverSecret,
            int effectiveTimeInSeconds,
            String roomId,
            boolean allowPublish
    ) {
        validateInputs(appId, userId, serverSecret, effectiveTimeInSeconds, roomId);

        try {
            byte[] ivBytes = new byte[IV_LENGTH];
            new SecureRandom().nextBytes(ivBytes);

            long nowTime = System.currentTimeMillis() / 1000;
            long expireTime = nowTime + effectiveTimeInSeconds;

            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("room_id", roomId);

            Map<String, Integer> privilege = new LinkedHashMap<>();
            privilege.put(PRIVILEGE_LOGIN, PRIVILEGE_ENABLED);
            privilege.put(PRIVILEGE_PUBLISH, allowPublish ? PRIVILEGE_ENABLED : PRIVILEGE_DISABLED);
            payload.put("privilege", privilege);
            payload.put("stream_id_list", null);

            Map<String, Object> tokenBody = new LinkedHashMap<>();
            tokenBody.put("app_id", appId);
            tokenBody.put("user_id", userId);
            tokenBody.put("ctime", nowTime);
            tokenBody.put("expire", expireTime);
            tokenBody.put("nonce", new Random().nextInt());
            tokenBody.put("payload", OBJECT_MAPPER.writeValueAsString(payload));

            byte[] encryptedContent = encrypt(
                    OBJECT_MAPPER.writeValueAsBytes(tokenBody),
                    serverSecret.getBytes(StandardCharsets.UTF_8),
                    ivBytes
            );

            ByteBuffer buffer = ByteBuffer.wrap(new byte[encryptedContent.length + IV_LENGTH + 12]);
            buffer.order(ByteOrder.BIG_ENDIAN);
            buffer.putLong(expireTime);
            packBytes(ivBytes, buffer);
            packBytes(encryptedContent, buffer);

            return VERSION_FLAG + Base64.getEncoder().encodeToString(buffer.array());
        } catch (Exception exception) {
            throw new IllegalStateException("Could not generate ZEGO token", exception);
        }
    }

    private static void validateInputs(
            long appId,
            String userId,
            String serverSecret,
            int effectiveTimeInSeconds,
            String roomId
    ) {
        if (appId <= 0) {
            throw new IllegalArgumentException("ZEGO appId is required");
        }
        if (userId == null || userId.isBlank() || userId.length() > 64) {
            throw new IllegalArgumentException("ZEGO userId must be between 1 and 64 characters");
        }
        if (roomId == null || roomId.isBlank()) {
            throw new IllegalArgumentException("ZEGO roomId is required");
        }
        if (serverSecret == null || serverSecret.length() != 32) {
            throw new IllegalArgumentException("ZEGO server secret must be 32 characters");
        }
        if (effectiveTimeInSeconds <= 0) {
            throw new IllegalArgumentException("ZEGO token expiry must be greater than zero");
        }
    }

    private static byte[] encrypt(byte[] content, byte[] secretKey, byte[] ivBytes) throws Exception {
        SecretKeySpec key = new SecretKeySpec(secretKey, "AES");
        IvParameterSpec iv = new IvParameterSpec(ivBytes);

        Cipher cipher = Cipher.getInstance(TRANSFORMATION);
        cipher.init(Cipher.ENCRYPT_MODE, key, iv);
        return cipher.doFinal(content);
    }

    private static void packBytes(byte[] source, ByteBuffer target) {
        target.putShort((short) source.length);
        target.put(source);
    }
}
