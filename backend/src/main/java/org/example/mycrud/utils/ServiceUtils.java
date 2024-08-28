package org.example.mycrud.utils;

import com.nimbusds.openid.connect.sdk.assurance.evidences.attachment.Digest;
import org.springframework.util.DigestUtils;

public class ServiceUtils {
    public static String generateMD5(String input){
        DigestUtils.md5Digest(input.getBytes());
        byte[] thedigest = DigestUtils.md5Digest(input.getBytes());
        StringBuffer sb = new StringBuffer();
        for(int i=0; i<thedigest.length; i++){
            sb.append(String.format("%02x", thedigest[i]));
        }
        return sb.toString();
    }
}
